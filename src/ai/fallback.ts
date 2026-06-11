import type { ScoreResult } from '../types.js';

type DimensionKey = keyof ScoreResult['dimensions'];

const FALLBACK_CALLOUTS: Record<DimensionKey, string> = {
  activity: 'Increase your commit frequency. Aim for consistent contributions over the past 90 days.',
  quality: 'Add descriptions, topics, and aim for more stars on your repositories.',
  documentation: 'Add detailed READMEs with setup instructions to your repositories.',
  diversity: ' diversify your tech stack by working with more languages and project types.',
  community: 'Contribute to open source by submitting PRs and filing issues on other projects.',
};

export function getFallbackCallout(dimension: DimensionKey): string {
  return FALLBACK_CALLOUTS[dimension];
}
