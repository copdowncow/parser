import { analyzeJob } from '../ai/analyzer.js';
import { config } from '../config.js';
import type { InMemoryRepository } from '../db/repository.js';
import { TelegramNotifier } from '../notifications/telegram.js';
import { calculateOpportunity, classifyCompetition } from '../scoring/opportunity.js';
import type { UserProfile } from '../types.js';
import { GithubIssuesSource } from './github-issues-source.js';
import { MockSource } from './mock-source.js';
import type { JobSource } from './types.js';

export interface ParserRunResult {
  fetched: number;
  inserted: number;
  failedSources: string[];
  startedAt: string;
  finishedAt: string;
}

export class ParserRunner {
  private readonly notifier = new TelegramNotifier();
  private readonly sources: JobSource[];
  private running = false;
  private lastRun?: ParserRunResult;

  constructor(private readonly repo: InMemoryRepository, private readonly user: UserProfile) {
    this.sources = [new MockSource()];
    if (config.githubSourceEnabled) {
      this.sources.push(new GithubIssuesSource());
    }
  }

  status(): { running: boolean; lastRun?: ParserRunResult } {
    return { running: this.running, lastRun: this.lastRun };
  }

  async run(): Promise<ParserRunResult> {
    if (this.running) {
      throw new Error('Parser run is already in progress');
    }

    this.running = true;
    const startedAt = new Date().toISOString();
    let fetched = 0;
    let inserted = 0;
    const failedSources: string[] = [];

    try {
      for (const source of this.sources) {
        try {
          const jobs = await fetchWithRetry(source);
          fetched += jobs.length;

          for (const rawJob of jobs) {
            const { job, isNew } = this.repo.upsertJob(rawJob);
            if (isNew) inserted += 1;

            const ai = analyzeJob(job, this.user);
            const competitionLevel = classifyCompetition(job);
            const opportunity = calculateOpportunity({
              job,
              relevanceScore: ai.relevanceScore,
              urgencyScore: ai.urgencyScore,
              competitionLevel,
              minBudget: this.user.minBudget
            });

            this.repo.saveAnalysis({
              jobId: job.id,
              projectType: ai.projectType,
              difficulty: ai.difficulty,
              competitionLevel,
              urgencyScore: ai.urgencyScore,
              relevanceScore: ai.relevanceScore,
              opportunityScore: opportunity.score,
              opportunityBreakdown: opportunity.breakdown,
              analyzedAt: new Date()
            });

            if (opportunity.score >= config.opportunityAlertThreshold) {
              await this.notifier.send(
                `🚀 *High Opportunity Job*\n${job.title}\nScore: *${opportunity.score}*\nSource: ${job.source}\n${job.url}`
              );
            }
          }
        } catch (error) {
          failedSources.push(source.name);
          console.error(`Source ${source.name} failed`, error);
        }
      }

      const finishedAt = new Date().toISOString();
      const result = { fetched, inserted, failedSources, startedAt, finishedAt };
      this.lastRun = result;
      return result;
    } finally {
      this.running = false;
    }
  }
}

async function fetchWithRetry(source: JobSource): Promise<Awaited<ReturnType<JobSource['fetch']>>> {
  let attempts = 0;
  let lastError: unknown;
  while (attempts < 3) {
    attempts += 1;
    try {
      return await source.fetch();
    } catch (error) {
      lastError = error;
      if (attempts < 3) {
        await sleep(250 * attempts);
      }
    }
  }
  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
