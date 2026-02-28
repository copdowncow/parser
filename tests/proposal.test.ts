import { describe, expect, it } from 'vitest';
import { generateProposal } from '../src/ai/reply-generator.js';
import type { JobWithAnalysis, UserProfile } from '../src/types.js';

const user: UserProfile = {
  id: 'u-1',
  skills: ['node', 'react'],
  preferredStack: ['typescript'],
  minBudget: 600
};

const row: JobWithAnalysis = {
  job: {
    id: 'job-1',
    title: 'Build React dashboard',
    description: 'Need frontend dashboard with charts',
    source: 'mock',
    url: 'https://example.com/job-1',
    technologies: ['react', 'typescript'],
    publishedAt: new Date(),
    createdAt: new Date()
  },
  analysis: {
    jobId: 'job-1',
    projectType: 'frontend',
    difficulty: 'middle',
    competitionLevel: 'low',
    urgencyScore: 70,
    relevanceScore: 80,
    opportunityScore: 84,
    opportunityBreakdown: {
      freshness: 90,
      relevance: 80,
      competitionInverse: 100,
      budget: 75,
      urgency: 70,
      weightedTotal: 84
    },
    analyzedAt: new Date()
  }
};

describe('proposal generation', () => {
  it('includes title and user skills', () => {
    const proposal = generateProposal(row, user);
    expect(proposal).toContain('Build React dashboard');
    expect(proposal).toContain('node, react');
  });
});
