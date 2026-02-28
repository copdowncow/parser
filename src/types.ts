export type CompetitionLevel = 'low' | 'medium' | 'high';
export type DifficultyLevel = 'junior' | 'middle' | 'senior';
export type ProjectType = 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'ai';

export interface Job {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  technologies: string[];
  budget?: number;
  language?: string;
  publishedAt: Date;
  createdAt: Date;
}

export interface OpportunityBreakdown {
  freshness: number;
  relevance: number;
  competitionInverse: number;
  budget: number;
  urgency: number;
  weightedTotal: number;
}

export interface JobAnalysis {
  jobId: string;
  projectType: ProjectType;
  difficulty: DifficultyLevel;
  competitionLevel: CompetitionLevel;
  urgencyScore: number;
  relevanceScore: number;
  opportunityScore: number;
  opportunityBreakdown: OpportunityBreakdown;
  analyzedAt: Date;
}

export interface UserProfile {
  id: string;
  skills: string[];
  preferredStack: string[];
  minBudget?: number;
}

export interface JobFilters {
  technologies?: string[];
  minBudget?: number;
  projectType?: ProjectType;
  language?: string;
  difficulty?: DifficultyLevel;
  competitionLevel?: CompetitionLevel;
  minOpportunityScore?: number;
  source?: string;
  query?: string;
  limit?: number;
  offset?: number;
}

export interface JobWithAnalysis {
  job: Job;
  analysis?: JobAnalysis;
}

export interface PaginatedJobs {
  total: number;
  limit: number;
  offset: number;
  items: JobWithAnalysis[];
}

export type JobSeed = Omit<Job, 'id' | 'createdAt'>;
