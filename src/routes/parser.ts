import type { FastifyInstance } from 'fastify';
import type { ParserRunner } from '../parser/runner.js';

export async function registerParserRoutes(app: FastifyInstance, parser: ParserRunner): Promise<void> {
  app.get('/parser/status', async () => parser.status());

  app.post('/parser/run', async (_request, reply) => {
    try {
      return await parser.run();
    } catch (error) {
      if (error instanceof Error && error.message.includes('already in progress')) {
        return reply.status(409).send({ error: error.message });
      }
      throw error;
    }
  });
}
