import Fastify from 'fastify';
import { registerHealthRoutes } from './routes/health.js';
import { registerJobRoutes } from './routes/jobs.js';
import { registerParserRoutes } from './routes/parser.js';
import { registerProposalRoutes } from './routes/proposals.js';
import type { InMemoryRepository } from './db/repository.js';
import type { ParserRunner } from './parser/runner.js';
import type { UserProfile } from './types.js';

export async function createServer(repo: InMemoryRepository, parser: ParserRunner, user: UserProfile) {
  const app = Fastify({ logger: true });

  await registerHealthRoutes(app);
  await registerJobRoutes(app, repo);
  await registerParserRoutes(app, parser);
  await registerProposalRoutes(app, repo, user);

  return app;
}
