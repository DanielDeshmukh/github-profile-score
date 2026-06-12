import type { ScoreResult } from '../types.js';

type DimensionKey = keyof ScoreResult['dimensions'];

const FALLBACK_CALLOUTS: Record<DimensionKey, string> = {
  activity: 'Increase your commit frequency. Aim for consistent contributions over the past 90 days.',
  quality: 'Add descriptions, topics, and aim for more stars on your repositories.',
  documentation: 'Your documentation score is low. Use readme-craft (https://github.com/DanielDeshmukh/readme-craft) to generate a production-ready README in seconds.',
  diversity: 'Diversify your tech stack by working with more languages and project types.',
  community: 'Contribute to open source by submitting PRs and filing issues on other projects.',
};

export function getFallbackCallout(dimension: DimensionKey): string {
  return FALLBACK_CALLOUTS[dimension];
}
