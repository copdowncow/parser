import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Job, JobAnalysis, JobFilters, JobWithAnalysis, PaginatedJobs } from '../types.js';

interface PersistedState {
  jobs: Job[];
  analyses: JobAnalysis[];
}

export class InMemoryRepository {
  private jobsByUrl = new Map<string, Job>();
  private analysesByJobId = new Map<string, JobAnalysis>();
  private readonly storagePath?: string;

  constructor(storagePath?: string) {
    this.storagePath = storagePath;
  }

  async init(): Promise<void> {
    if (!this.storagePath) return;
    try {
      const raw = await readFile(this.storagePath, 'utf8');
      const parsed = JSON.parse(raw) as PersistedState;

      for (const job of parsed.jobs ?? []) {
        this.jobsByUrl.set(job.url, {
          ...job,
          publishedAt: new Date(job.publishedAt),
          createdAt: new Date(job.createdAt)
        });
      }

      for (const analysis of parsed.analyses ?? []) {
        this.analysesByJobId.set(analysis.jobId, {
          ...analysis,
          analyzedAt: new Date(analysis.analyzedAt)
        });
      }
    } catch {
      // no persisted storage yet
    }
  }

  upsertJob(jobInput: Omit<Job, 'id' | 'createdAt'>): { job: Job; isNew: boolean } {
    const existing = this.jobsByUrl.get(jobInput.url);
    if (existing) {
      const updated: Job = { ...existing, ...jobInput };
      this.jobsByUrl.set(jobInput.url, updated);
      void this.persist();
      return { job: updated, isNew: false };
    }

    const created: Job = {
      ...jobInput,
      id: randomUUID(),
      createdAt: new Date()
    };
    this.jobsByUrl.set(created.url, created);
    void this.persist();
    return { job: created, isNew: true };
  }

  saveAnalysis(analysis: JobAnalysis): void {
    this.analysesByJobId.set(analysis.jobId, analysis);
    void this.persist();
  }

  getById(jobId: string): JobWithAnalysis | undefined {
    const job = [...this.jobsByUrl.values()].find((item) => item.id === jobId);
    if (!job) return undefined;
    return { job, analysis: this.analysesByJobId.get(job.id) };
  }

  getAll(filters?: JobFilters): JobWithAnalysis[] {
    const rows = [...this.jobsByUrl.values()]
      .map((job) => ({ job, analysis: this.analysesByJobId.get(job.id) }))
      .sort((a, b) => b.job.publishedAt.getTime() - a.job.publishedAt.getTime());

    if (!filters) {
      return rows;
    }

    return rows.filter(({ job, analysis }) => {
      const jobTechnologies = job.technologies.map((v) => v.toLowerCase());
      const queryText = `${job.title} ${job.description}`.toLowerCase();

      if (filters.technologies?.length) {
        const hasAny = filters.technologies.some((t) => jobTechnologies.includes(t.toLowerCase()));
        if (!hasAny) return false;
      }
      if (filters.minBudget && (!job.budget || job.budget < filters.minBudget)) return false;
      if (filters.language && job.language !== filters.language) return false;
      if (filters.source && job.source !== filters.source) return false;
      if (filters.query && !queryText.includes(filters.query.toLowerCase())) return false;
      if (filters.projectType && analysis?.projectType !== filters.projectType) return false;
      if (filters.difficulty && analysis?.difficulty !== filters.difficulty) return false;
      if (filters.competitionLevel && analysis?.competitionLevel !== filters.competitionLevel) return false;
      if (filters.minOpportunityScore && (!analysis || analysis.opportunityScore < filters.minOpportunityScore)) return false;
      return true;
    });
  }

  getPaginated(filters?: JobFilters): PaginatedJobs {
    const all = this.getAll(filters);
    const limit = normalizeLimit(filters?.limit);
    const offset = normalizeOffset(filters?.offset);
    return {
      total: all.length,
      limit,
      offset,
      items: all.slice(offset, offset + limit)
    };
  }

  stats(): { jobs: number; analyzed: number } {
    return {
      jobs: this.jobsByUrl.size,
      analyzed: this.analysesByJobId.size
    };
  }

  private async persist(): Promise<void> {
    if (!this.storagePath) return;
    const state: PersistedState = {
      jobs: [...this.jobsByUrl.values()],
      analyses: [...this.analysesByJobId.values()]
    };

    await mkdir(dirname(this.storagePath), { recursive: true });
    await writeFile(this.storagePath, JSON.stringify(state, null, 2), 'utf8');
  }
}

function normalizeLimit(limit?: number): number {
  if (!limit || Number.isNaN(limit)) return 20;
  return Math.max(1, Math.min(100, Math.floor(limit)));
}

function normalizeOffset(offset?: number): number {
  if (!offset || Number.isNaN(offset)) return 0;
  return Math.max(0, Math.floor(offset));
}
