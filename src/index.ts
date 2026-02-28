import { config } from './config.js';
import { InMemoryRepository } from './db/repository.js';
import { ParserRunner } from './parser/runner.js';
import { createServer } from './server.js';
import type { UserProfile } from './types.js';

const defaultUser: UserProfile = {
  id: 'default-user',
  skills: ['node', 'fastify', 'react', 'python'],
  preferredStack: ['typescript', 'postgresql'],
  minBudget: 700
};

async function bootstrap() {
  const repo = new InMemoryRepository(config.storageFilePath);
  await repo.init();

  const parser = new ParserRunner(repo, defaultUser);

  await parser.run();

  setInterval(() => {
    parser.run().catch((error) => {
      console.error('Parser cycle failed', error);
    });
  }, config.parserIntervalMinutes * 60 * 1000);

  const app = await createServer(repo, parser, defaultUser);
  await app.listen({ host: config.host, port: config.port });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
