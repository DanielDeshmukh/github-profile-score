import type { GitHubRepo } from '../../types.js';
import { normalize } from '../normalizer.js';

interface QualitySignals {
  totalStars: number;
  totalForks: number;
  percentWithDescription: number;
  percentWithTopics: number;
}

function extractSignals(repos: GitHubRepo[]): QualitySignals {
  const nonForks = repos.filter((r) => !r.fork);
  const totalStars = nonForks.reduce((sum, r) => sum + r.stargazers_count, 0);
  const totalForks = nonForks.reduce((sum, r) => sum + r.forks_count, 0);
  const withDescription = nonForks.filter((r) => r.description && r.description.length > 0).length;
  const withTopics = nonForks.filter((r) => r.topics && r.topics.length > 0).length;

  return {
    totalStars,
    totalForks,
    percentWithDescription: nonForks.length > 0 ? (withDescription / nonForks.length) * 100 : 0,
    percentWithTopics: nonForks.length > 0 ? (withTopics / nonForks.length) * 100 : 0,
  };
}

export function score(repos: GitHubRepo[]): { score: number; reason: string } {
  const signals = extractSignals(repos);

  const starsScore = normalize(signals.totalStars, 0, 500, 8);
  const forksScore = normalize(signals.totalForks, 0, 100, 4);
  const descScore = normalize(signals.percentWithDescription, 0, 100, 4);
  const topicsScore = normalize(signals.percentWithTopics, 0, 100, 4);

  const total = starsScore + forksScore + descScore + topicsScore;

  const parts: string[] = [];
  if (signals.totalStars > 0) parts.push(`${signals.totalStars} total stars`);
  if (signals.percentWithDescription > 50) parts.push('most repos have descriptions');
  if (signals.percentWithTopics > 30) parts.push('repos use topics');
  if (signals.totalStars === 0 && signals.percentWithDescription < 50) parts.push('repos lack descriptions');

  return {
    score: Math.min(20, total),
    reason: parts.length > 0 ? parts.join(', ') : 'No quality signals found',
  };
}
