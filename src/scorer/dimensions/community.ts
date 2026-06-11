import type { GitHubProfile, GitHubEvent } from '../../types.js';
import { normalize } from '../normalizer.js';

interface CommunitySignals {
  prsToOthers: number;
  issuesFiled: number;
  hasOrgMembership: boolean;
  followersFollowingRatio: number;
}

function extractSignals(profile: GitHubProfile, events: GitHubEvent[]): CommunitySignals {
  const prEvents = events.filter((e) => e.type === 'PullRequestEvent');
  const issuesEvents = events.filter((e) => e.type === 'IssuesEvent');

  return {
    prsToOthers: prEvents.length,
    issuesFiled: issuesEvents.length,
    hasOrgMembership: profile.company !== null && profile.company.length > 0,
    followersFollowingRatio: profile.following > 0
      ? profile.followers / profile.following
      : profile.followers > 0 ? 10 : 0,
  };
}

export function score(profile: GitHubProfile, events: GitHubEvent[]): { score: number; reason: string } {
  const signals = extractSignals(profile, events);

  const prScore = normalize(signals.prsToOthers, 0, 20, 6);
  const issueScore = normalize(signals.issuesFiled, 0, 15, 4);
  const orgScore = signals.hasOrgMembership ? 3 : 0;

  let ratioScore = 1;
  if (signals.followersFollowingRatio > 1) ratioScore = 4;
  else if (signals.followersFollowingRatio >= 0.5) ratioScore = 3;
  else if (signals.followersFollowingRatio >= 0.2) ratioScore = 2;

  const total = prScore + issueScore + orgScore + ratioScore;

  const parts: string[] = [];
  if (signals.prsToOthers > 0) parts.push(`${signals.prsToOthers} PRs to others`);
  if (signals.issuesFiled > 0) parts.push(`${signals.issuesFiled} issues filed`);
  if (signals.hasOrgMembership) parts.push('org member');
  if (signals.followersFollowingRatio > 1) parts.push('healthy follower ratio');

  return {
    score: Math.min(20, total),
    reason: parts.length > 0 ? parts.join(', ') : 'Limited community signals',
  };
}
