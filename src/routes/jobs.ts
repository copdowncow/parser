import type { FastifyInstance } from 'fastify';
import type { InMemoryRepository } from '../db/repository.js';
import type { JobFilters } from '../types.js';

function toArray(value: unknown): string[] | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) return value.flatMap((v) => String(v).split(','));
  return String(value).split(',');
}

function toNumber(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function registerJobRoutes(app: FastifyInstance, repo: InMemoryRepository): Promise<void> {
  app.get('/jobs', async (request) => {
    const q = request.query as Record<string, string | string[] | undefined>;
    const filters: JobFilters = {
      technologies: toArray(q.technologies),
      minBudget: toNumber(q.minBudget),
      projectType: q.projectType as JobFilters['projectType'],
      language: q.language as string | undefined,
      difficulty: q.difficulty as JobFilters['difficulty'],
      competitionLevel: q.competitionLevel as JobFilters['competitionLevel'],
      minOpportunityScore: toNumber(q.minOpportunityScore),
      source: q.source ? String(q.source) : undefined,
      query: q.query ? String(q.query) : undefined,
      limit: toNumber(q.limit),
      offset: toNumber(q.offset)
    };

    return repo.getPaginated(filters);
  });

  app.get('/jobs/:id', async (request, reply) => {
    const params = request.params as { id: string };
    const row = repo.getById(params.id);
    if (!row) {
      return reply.status(404).send({ error: 'Job not found' });
    }
    return row;
  });

  app.get('/stats', async () => repo.stats());
}
