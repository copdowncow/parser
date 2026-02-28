import type { JobSeed } from '../types.js';

export interface JobSource {
  name: string;
  fetch(): Promise<JobSeed[]>;
}
