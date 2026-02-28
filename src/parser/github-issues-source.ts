import { config } from '../config.js';
import type { JobSeed } from '../types.js';
import type { JobSource } from './types.js';

interface GithubIssue {
  title: string;
  body: string | null;
  html_url: string;
  created_at: string;
  labels: Array<{ name: string }>;
  pull_request?: unknown;
}

export class GithubIssuesSource implements JobSource {
  name = 'github-issues';

  async fetch(): Promise<JobSeed[]> {
    const url = new URL(`https://api.github.com/repos/${config.githubOwner}/${config.githubRepo}/issues`);
    url.searchParams.set('state', 'open');
    url.searchParams.set('labels', config.githubLabel);
    url.searchParams.set('per_page', '30');

    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'ai-job-opportunity-radar'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub source failed: ${response.status}`);
    }

    const issues = (await response.json()) as GithubIssue[];

    return issues
      .filter((issue) => !issue.pull_request)
      .map((issue) => {
        const body = issue.body ?? '';
        const technologies = extractTechnologies(`${issue.title} ${body}`);

        return {
          title: issue.title,
          description: body || 'No description provided',
          source: this.name,
          url: issue.html_url,
          technologies,
          language: 'en',
          publishedAt: new Date(issue.created_at)
        };
      });
  }
}

function extractTechnologies(text: string): string[] {
  const t = text.toLowerCase();
  const tokens = [
    'react',
    'nextjs',
    'node',
    'typescript',
    'javascript',
    'python',
    'go',
    'java',
    'kotlin',
    'swift',
    'docker',
    'postgresql'
  ];

  return tokens.filter((token) => t.includes(token));
}
