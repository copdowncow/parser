import type { JobWithAnalysis, UserProfile } from '../types.js';

export function generateProposal(jobRow: JobWithAnalysis, user: UserProfile): string {
  const tech = jobRow.job.technologies.join(', ') || 'relevant stack';
  const scoreLine = jobRow.analysis
    ? `Based on my fit analysis, this project currently has an Opportunity Score of ${jobRow.analysis.opportunityScore}/100.`
    : 'I reviewed your project and it is a strong match for my profile.';

  return [
    `Hello! I can help with "${jobRow.job.title}".`,
    `I have practical experience with ${tech}, and my primary skills are ${user.skills.join(', ')}.`,
    scoreLine,
    'I can start quickly, provide clear milestones, and keep communication transparent throughout delivery.',
    'If useful, I can share a short implementation plan and estimate in the next message.'
  ].join(' ');
}
