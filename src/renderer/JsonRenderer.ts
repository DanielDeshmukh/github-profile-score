import type { ScoreResult } from '../types.js';

export function renderJson(result: ScoreResult): ScoreResult {
  return {
    username: result.username,
    total: result.total,
    grade: result.grade,
    dimensions: {
      activity: { score: result.dimensions.activity.score, max: result.dimensions.activity.max, callout: result.dimensions.activity.callout, reason: result.dimensions.activity.reason },
      quality: { score: result.dimensions.quality.score, max: result.dimensions.quality.max, callout: result.dimensions.quality.callout, reason: result.dimensions.quality.reason },
      documentation: { score: result.dimensions.documentation.score, max: result.dimensions.documentation.max, callout: result.dimensions.documentation.callout, reason: result.dimensions.documentation.reason },
      diversity: { score: result.dimensions.diversity.score, max: result.dimensions.diversity.max, callout: result.dimensions.diversity.callout, reason: result.dimensions.diversity.reason },
      community: { score: result.dimensions.community.score, max: result.dimensions.community.max, callout: result.dimensions.community.callout, reason: result.dimensions.community.reason },
    },
    cached: result.cached,
    cache_age_seconds: result.cache_age_seconds,
    scored_at: result.scored_at,
  };
}
