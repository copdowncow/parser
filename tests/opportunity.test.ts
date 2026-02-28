import { describe, expect, it } from 'vitest';
import { calculateOpportunity, calculateOpportunityScore, classifyCompetition } from '../src/scoring/opportunity.js';
import type { Job } from '../src/types.js';

const baseJob: Job = {
  id: '1',
  title: 'Test',
  description: 'Test',
  source: 'mock',
  url: 'https://example.com/1',
  technologies: ['node'],
  publishedAt: new Date(Date.now() - 1000 * 60 * 20),
  createdAt: new Date()
};

describe('opportunity score', () => {
  it('returns higher score for strong match', () => {
    const score = calculateOpportunityScore({
      job: baseJob,
      relevanceScore: 90,
      urgencyScore: 95,
      competitionLevel: 'low',
      minBudget: 400
    });

    expect(score).toBeGreaterThanOrEqual(80);
  });

  it('returns breakdown with all components', () => {
    const result = calculateOpportunity({
      job: baseJob,
      relevanceScore: 70,
      urgencyScore: 55,
      competitionLevel: 'medium',
      minBudget: 600
    });

    expect(result.breakdown.freshness).toBeTypeOf('number');
    expect(result.breakdown.weightedTotal).toBeTypeOf('number');
  });

  it('classifies old jobs as high competition', () => {
    const oldJob: Job = { ...baseJob, publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 30) };
    expect(classifyCompetition(oldJob)).toBe('high');
  });
});
