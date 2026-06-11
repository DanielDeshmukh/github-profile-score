import type { GitHubRepo } from '../../types.js';
import { normalize } from '../normalizer.js';

interface DocumentationSignals {
  percentWithReadme: number;
  avgReadmeLength: number;
  hasPages: boolean;
  hasWiki: boolean;
}

function extractSignals(repos: GitHubRepo[]): DocumentationSignals {
  const nonForks = repos.filter((r) => !r.fork);
  const withReadme = nonForks.filter((r) => r.description && r.description.length > 50).length;
  const hasPages = nonForks.some((r) => r.has_pages);
  const hasWiki = nonForks.some((r) => r.has_wiki);

  return {
    percentWithReadme: nonForks.length > 0 ? (withReadme / nonForks.length) * 100 : 0,
    avgReadmeLength: nonForks.length > 0
      ? nonForks.reduce((sum, r) => sum + (r.description?.length ?? 0), 0) / nonForks.length
      : 0,
    hasPages,
    hasWiki,
  };
}

export function score(repos: GitHubRepo[]): { score: number; reason: string } {
  const signals = extractSignals(repos);

  const readmeScore = normalize(signals.percentWithReadme, 0, 100, 8);
  const lengthScore = normalize(signals.avgReadmeLength, 0, 200, 6);
  const pagesScore = signals.hasPages ? 2 : 0;
  const wikiScore = signals.hasWiki ? 1 : 0;

  const total = readmeScore + lengthScore + pagesScore + wikiScore;

  const parts: string[] = [];
  if (signals.percentWithReadme > 70) parts.push('most repos have substantial descriptions');
  else if (signals.percentWithReadme < 30) parts.push('few repos have detailed READMEs');
  if (signals.hasPages) parts.push('has GitHub Pages');
  if (signals.hasWiki) parts.push('uses wiki');

  return {
    score: Math.min(20, total),
    reason: parts.length > 0 ? parts.join(', ') : 'Limited documentation signals',
  };
}
