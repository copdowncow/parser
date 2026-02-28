import type { DifficultyLevel, Job, ProjectType, UserProfile } from '../types.js';

const TECH_HINTS: Record<string, string[]> = {
  react: ['react', 'next.js', 'nextjs'],
  node: ['node', 'node.js', 'express', 'fastify', 'nestjs'],
  python: ['python', 'django', 'fastapi', 'flask'],
  mobile: ['ios', 'android', 'flutter', 'react native'],
  ai: ['llm', 'nlp', 'machine learning', 'ai', 'rag']
};

export interface AnalyzerResult {
  technologies: string[];
  projectType: ProjectType;
  difficulty: DifficultyLevel;
  urgencyScore: number;
  relevanceScore: number;
}

export function analyzeJob(job: Job, user: UserProfile): AnalyzerResult {
  const text = `${job.title} ${job.description}`.toLowerCase();
  const technologies = Object.entries(TECH_HINTS)
    .filter(([, hints]) => hints.some((h) => text.includes(h)))
    .map(([key]) => key);

  const projectType = resolveProjectType(text);
  const difficulty = resolveDifficulty(text);
  const urgencyScore = resolveUrgency(text);
  const relevanceScore = calcRelevance(technologies, user.skills);

  return {
    technologies: technologies.length ? technologies : job.technologies,
    projectType,
    difficulty,
    urgencyScore,
    relevanceScore
  };
}

function resolveProjectType(text: string): ProjectType {
  if (text.includes('mobile') || text.includes('ios') || text.includes('android')) return 'mobile';
  if (text.includes('ai') || text.includes('ml') || text.includes('llm')) return 'ai';
  if (text.includes('frontend') && text.includes('backend')) return 'fullstack';
  if (text.includes('frontend')) return 'frontend';
  return 'backend';
}

function resolveDifficulty(text: string): DifficultyLevel {
  if (text.includes('senior') || text.includes('architecture') || text.includes('highload')) return 'senior';
  if (text.includes('junior') || text.includes('entry')) return 'junior';
  return 'middle';
}

function resolveUrgency(text: string): number {
  if (text.includes('urgent') || text.includes('asap') || text.includes('today')) return 95;
  if (text.includes('this week')) return 75;
  return 55;
}

function calcRelevance(technologies: string[], skills: string[]): number {
  if (!skills.length) return 0;
  const normalizedSkills = skills.map((s) => s.toLowerCase());
  const matched = technologies.filter((t) => normalizedSkills.includes(t.toLowerCase())).length;
  return Math.round((matched / normalizedSkills.length) * 100);
}
