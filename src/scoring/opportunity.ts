import type { CompetitionLevel, Job, OpportunityBreakdown } from '../types.js';

export function calculateOpportunity(input: {
  job: Job;
  relevanceScore: number;
  urgencyScore: number;
  competitionLevel: CompetitionLevel;
  minBudget?: number;
}): { score: number; breakdown: OpportunityBreakdown } {
  const freshness = freshnessScore(input.job.publishedAt);
  const competitionInverse = competitionToScore(input.competitionLevel);
  const budget = budgetToScore(input.job.budget, input.minBudget);

  const weightedTotal =
    0.3 * freshness +
    0.3 * input.relevanceScore +
    0.2 * competitionInverse +
    0.1 * budget +
    0.1 * input.urgencyScore;

  const score = Math.max(0, Math.min(100, Math.round(weightedTotal)));

  return {
    score,
    breakdown: {
      freshness,
      relevance: input.relevanceScore,
      competitionInverse,
      budget,
      urgency: input.urgencyScore,
      weightedTotal: Math.round(weightedTotal)
    }
  };
}

export function calculateOpportunityScore(input: {
  job: Job;
  relevanceScore: number;
  urgencyScore: number;
  competitionLevel: CompetitionLevel;
  minBudget?: number;
}): number {
  return calculateOpportunity(input).score;
}

export function classifyCompetition(job: Job): CompetitionLevel {
  const ageHours = (Date.now() - job.publishedAt.getTime()) / (1000 * 60 * 60);
  if (ageHours <= 3) return 'low';
  if (ageHours <= 24) return 'medium';
  return 'high';
}

function freshnessScore(publishedAt: Date): number {
  const ageHours = Math.max(0, (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60));
  if (ageHours <= 1) return 100;
  if (ageHours <= 6) return 90;
  if (ageHours <= 24) return 70;
  if (ageHours <= 72) return 50;
  return 25;
}

function competitionToScore(level: CompetitionLevel): number {
  if (level === 'low') return 100;
  if (level === 'medium') return 60;
  return 20;
}

function budgetToScore(budget?: number, minBudget?: number): number {
  if (!budget) return 40;
  if (!minBudget) return Math.min(100, Math.round(budget / 20));
  if (budget >= minBudget * 1.5) return 100;
  if (budget >= minBudget) return 75;
  return 25;
}
