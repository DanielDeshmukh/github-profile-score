import { getConfig } from '../config.js';
import { createChildLogger } from '../logger.js';
import { buildPrompt } from './promptBuilder.js';
import { validateCallout } from './validator.js';
import { getFallbackCallout } from './fallback.js';
import type { ScoreResult } from '../types.js';

const log = createChildLogger('ai-callout');

type DimensionKey = keyof ScoreResult['dimensions'];

interface NvidiaResponse {
  choices: Array<{ message: { content: string } }>;
}

export async function generateCallouts(
  result: ScoreResult,
): Promise<void> {
  const config = getConfig();
  const threshold = config.SCORE_THRESHOLD;

  const dimensionsNeedingCallouts = (Object.entries(result.dimensions) as [DimensionKey, ScoreResult['dimensions'][DimensionKey]][])
    .filter(([_, d]) => d.score < threshold);

  if (dimensionsNeedingCallouts.length === 0) return;

  if (!config.NVIDIA_API_KEY) {
    log.info('NVIDIA_API_KEY not set, using fallback callouts');
    dimensionsNeedingCallouts.forEach(([key, dim]) => {
      dim.callout = getFallbackCallout(key);
    });
    return;
  }

  const promises = dimensionsNeedingCallouts.map(async ([key, dim]) => {
    try {
      const callout = await callNvidiaNim(key, dim.score, dim.reason, config.NVIDIA_API_KEY!, config.NVIDIA_MODEL);
      if (validateCallout(callout)) {
        dim.callout = callout;
      } else {
        dim.callout = getFallbackCallout(key);
      }
    } catch (err) {
      log.warn({ dimension: key, error: err instanceof Error ? err.message : err }, 'NIM call failed, using fallback');
      dim.callout = getFallbackCallout(key);
    }
  });

  await Promise.allSettled(promises);
}

async function callNvidiaNim(
  dimension: DimensionKey,
  score: number,
  reason: string,
  apiKey: string,
  model: string,
): Promise<string> {
  const prompt = buildPrompt({ dimension, score, reason });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`NVIDIA NIM error: ${response.status}`);
    }

    const data = (await response.json()) as NvidiaResponse;
    return data.choices[0]?.message?.content?.trim() ?? '';
  } finally {
    clearTimeout(timeout);
  }
}
