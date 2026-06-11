import type { ScoreResult } from '../types.js';

type DimensionKey = keyof ScoreResult['dimensions'];

interface PromptContext {
  dimension: DimensionKey;
  score: number;
  reason: string;
}

export function buildPrompt(ctx: PromptContext): string {
  const dimensionNames: Record<DimensionKey, string> = {
    activity: 'Activity',
    quality: 'Project Quality',
    documentation: 'Documentation',
    diversity: 'Tech Diversity',
    community: 'Community',
  };

  return `You are a GitHub profile coach. A developer scored ${ctx.score}/20 on "${dimensionNames[ctx.dimension]}".
Current signals: ${ctx.reason}

Write a 1-2 sentence actionable fix suggestion. Be specific and practical. No markdown, no extra formatting. Max 150 characters.`;
}
