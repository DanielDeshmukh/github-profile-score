import type { GitHubProfile, GitHubRepo, GitHubEvent, ScoreResult } from '../types.js';
import * as activity from './dimensions/activity.js';
import * as quality from './dimensions/quality.js';
import * as documentation from './dimensions/documentation.js';
import * as diversity from './dimensions/diversity.js';
import * as community from './dimensions/community.js';

function calculateGrade(total: number): ScoreResult['grade'] {
  if (total >= 90) return 'A';
  if (total >= 80) return 'B';
  if (total >= 70) return 'C';
  if (total >= 60) return 'D';
  return 'F';
}

export function score(
  profile: GitHubProfile,
  repos: GitHubRepo[],
  events: GitHubEvent[],
  threshold: number = 14,
): ScoreResult {
  const activityResult = activity.score(repos, events);
  const qualityResult = quality.score(repos);
  const documentationResult = documentation.score(repos);
  const diversityResult = diversity.score(repos);
  const communityResult = community.score(profile, events);

  const dimensions = {
    activity: {
      score: activityResult.score,
      max: 20,
      callout: activityResult.score < threshold ? '' : null,
      reason: activityResult.reason,
    },
    quality: {
      score: qualityResult.score,
      max: 20,
      callout: qualityResult.score < threshold ? '' : null,
      reason: qualityResult.reason,
    },
    documentation: {
      score: documentationResult.score,
      max: 20,
      callout: documentationResult.score < threshold ? '' : null,
      reason: documentationResult.reason,
    },
    diversity: {
      score: diversityResult.score,
      max: 20,
      callout: diversityResult.score < threshold ? '' : null,
      reason: diversityResult.reason,
    },
    community: {
      score: communityResult.score,
      max: 20,
      callout: communityResult.score < threshold ? '' : null,
      reason: communityResult.reason,
    },
  };

  const total = Object.values(dimensions).reduce((sum, d) => sum + d.score, 0);

  return {
    username: profile.login,
    total,
    grade: calculateGrade(total),
    dimensions,
    cached: false,
    cache_age_seconds: 0,
    scored_at: new Date().toISOString(),
  };
}
