import type { JobSeed } from '../types.js';
import type { JobSource } from './types.js';

export class MockSource implements JobSource {
  name = 'mock-board';

  async fetch(): Promise<JobSeed[]> {
    const now = Date.now();

    return [
      {
        title: 'Build Fastify API for SaaS dashboard',
        description: 'Need backend developer with Node.js, Fastify and PostgreSQL. Urgent, start today.',
        source: this.name,
        url: 'https://example.com/jobs/fastify-api',
        technologies: ['node', 'fastify', 'postgresql'],
        budget: 1200,
        language: 'en',
        publishedAt: new Date(now - 1000 * 60 * 20)
      },
      {
        title: 'React frontend for analytics UI',
        description: 'Frontend React + TypeScript. Delivery this week.',
        source: this.name,
        url: 'https://example.com/jobs/react-frontend',
        technologies: ['react', 'typescript'],
        budget: 900,
        language: 'en',
        publishedAt: new Date(now - 1000 * 60 * 90)
      }
    ];
  }
}
