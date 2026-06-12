import type { GitHubRepo } from '../../types.js';
import { normalize } from '../normalizer.js';

interface DiversitySignals {
  uniqueLanguages: number;
  repoTypeSpread: number;
  hasMultipleCategories: boolean;
}

function classifyRepo(repo: GitHubRepo): string {
  const topics = (repo.topics ?? []).map((t) => t.toLowerCase());
  const desc = (repo.description ?? '').toLowerCase();
  const name = (repo.name ?? '').toLowerCase();
  const combined = `${desc} ${topics.join(' ')} ${name}`;

  if (topics.includes('library') || topics.includes('package') || topics.includes('sdk') || /\b(library|package|sdk|module)\b/.test(combined)) return 'library';
  if (topics.includes('cli') || topics.includes('tool') || topics.includes('utility') || /\b(cli|tool|utility|automation|scraper|bot|agent|swarm|orchestrat)\b/.test(combined)) return 'tool';
  if (topics.includes('app') || topics.includes('application') || topics.includes('web') || /\b(app|application|web|website|dashboard|ui|frontend|interface)\b/.test(combined)) return 'app';
  if (topics.includes('api') || /\b(api|rag|retrieval|backend|server|fastapi|endpoint)\b/.test(combined)) return 'api';
  if ((repo.language ?? '').toLowerCase() === 'jupyter notebook' || /\b(research|fine-tune|finetune|model|notebook|dataset)\b/.test(combined)) return 'research';
  return 'other';
}

function extractSignals(repos: GitHubRepo[]): DiversitySignals {
  const nonForks = repos.filter((r) => !r.fork);
  const languages = new Set(nonForks.filter((r) => r.language).map((r) => r.language));

  const categories = new Set(nonForks.map((r) => classifyRepo(r)));

  return {
    uniqueLanguages: languages.size,
    repoTypeSpread: categories.size,
    hasMultipleCategories: categories.size >= 3,
  };
}

export function score(repos: GitHubRepo[]): { score: number; reason: string } {
  const signals = extractSignals(repos);

  const langScore = normalize(signals.uniqueLanguages, 0, 10, 8);
  const spreadScore = normalize(signals.repoTypeSpread, 0, 6, 7);
  const multiCategoryScore = signals.hasMultipleCategories ? 5 : normalize(signals.repoTypeSpread, 0, 3, 5);

  const total = langScore + spreadScore + multiCategoryScore;

  const parts: string[] = [];
  if (signals.uniqueLanguages > 0) parts.push(`${signals.uniqueLanguages} languages used`);
  if (signals.repoTypeSpread > 1) parts.push(`${signals.repoTypeSpread} repo categories`);
  if (signals.hasMultipleCategories) parts.push('diverse project types');

  return {
    score: Math.min(20, total),
    reason: parts.length > 0 ? parts.join(', ') : 'Limited tech diversity',
  };
}
