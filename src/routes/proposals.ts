import type { FastifyInstance } from 'fastify';
import type { InMemoryRepository } from '../db/repository.js';
import type { UserProfile } from '../types.js';
import { generateProposal } from '../ai/reply-generator.js';

export async function registerProposalRoutes(
  app: FastifyInstance,
  repo: InMemoryRepository,
  user: UserProfile
): Promise<void> {
  app.post('/proposals/generate', async (request, reply) => {
    const body = request.body as { jobId?: string };
    if (!body?.jobId) {
      return reply.status(400).send({ error: 'jobId is required' });
    }

    const row = repo.getById(body.jobId);
    if (!row) {
      return reply.status(404).send({ error: 'Job not found' });
    }

    return {
      jobId: row.job.id,
      proposal: generateProposal(row, user)
    };
  });
}
