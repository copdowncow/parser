import { mkdtemp, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { InMemoryRepository } from '../src/db/repository.js';

const repo = new InMemoryRepository();
const { job } = repo.upsertJob({
  title: 'Need React dashboard',
  description: 'Build frontend analytics dashboard',
  source: 'mock-board',
  url: 'https://example.com/r1',
  technologies: ['react', 'typescript'],
  budget: 800,
  language: 'en',
  publishedAt: new Date()
});

repo.saveAnalysis({
  jobId: job.id,
  projectType: 'frontend',
  difficulty: 'middle',
  competitionLevel: 'low',
  urgencyScore: 75,
  relevanceScore: 80,
  opportunityScore: 82,
  opportunityBreakdown: {
    freshness: 90,
    relevance: 80,
    competitionInverse: 100,
    budget: 75,
    urgency: 75,
    weightedTotal: 82
  },
  analyzedAt: new Date()
});

describe('repository filters', () => {
  it('filters by source', () => {
    const result = repo.getAll({ source: 'mock-board' });
    expect(result).toHaveLength(1);
  });

  it('filters by query', () => {
    const result = repo.getAll({ query: 'analytics' });
    expect(result).toHaveLength(1);
  });

  it('returns paginated payload', () => {
    const result = repo.getPaginated({ limit: 1, offset: 0 });
    expect(result.total).toBeGreaterThanOrEqual(1);
    expect(result.items).toHaveLength(1);
  });

  it('persists data to disk', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'radar-repo-'));
    const file = join(dir, 'storage.json');
    const persistentRepo = new InMemoryRepository(file);

    persistentRepo.upsertJob({
      title: 'Persistent job',
      description: 'Stored to file',
      source: 'mock',
      url: 'https://example.com/persistent',
      technologies: ['node'],
      publishedAt: new Date()
    });

    await new Promise((resolve) => setTimeout(resolve, 30));
    const content = await readFile(file, 'utf8');
    expect(content).toContain('Persistent job');
  });

  it('filters by non-matching query', () => {
    const result = repo.getAll({ query: 'golang' });
    expect(result).toHaveLength(0);
  });
});
