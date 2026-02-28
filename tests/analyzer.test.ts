import { describe, expect, it } from 'vitest';
import { analyzeJob } from '../src/ai/analyzer.js';
import type { Job, UserProfile } from '../src/types.js';

const user: UserProfile = {
  id: 'u1',
  skills: ['react', 'node'],
  preferredStack: ['typescript']
};

const job: Job = {
  id: 'j1',
  title: 'Urgent frontend React work',
  description: 'Need React frontend developer ASAP',
  source: 'mock',
  url: 'https://example.com/j1',
  technologies: ['react'],
  publishedAt: new Date(),
  createdAt: new Date()
};

describe('analyzer', () => {
  it('detects frontend project type', () => {
    const result = analyzeJob(job, user);
    expect(result.projectType).toBe('frontend');
  });

  it('returns high urgency for urgent text', () => {
    const result = analyzeJob(job, user);
    expect(result.urgencyScore).toBe(95);
  });
});
