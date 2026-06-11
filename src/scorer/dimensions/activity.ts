import type { GitHubRepo, GitHubEvent } from '../../types.js';
import { normalize } from '../normalizer.js';

interface ActivitySignals {
  commitsLast90Days: number;
  longestStreak: number;
  daysSinceLastPush: number;
}

function extractSignals(_repos: GitHubRepo[], events: GitHubEvent[]): ActivitySignals {
  const commitEvents = events.filter((e) => e.type === 'PushEvent');
  const commitsLast90Days = commitEvents.reduce((sum, e) => {
    const count = (e.payload as { size?: number }).size ?? 0;
    return sum + count;
  }, 0);

  const pushDates = new Set<string>();
  for (const event of commitEvents) {
    pushDates.add(new Date(event.created_at).toISOString().split('T')[0]!);
  }

  const sortedDates = Array.from(pushDates).sort();
  let longestStreak = 0;
  let currentStreak = 0;
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      currentStreak = 1;
    } else {
      const prev = new Date(sortedDates[i - 1]!);
      const curr = new Date(sortedDates[i]!);
      const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, currentStreak);
  }

  const allPushDates = Array.from(pushDates).sort().reverse();
  const lastPushDate = allPushDates[0];
  const daysSinceLastPush = lastPushDate
    ? Math.floor((Date.now() - new Date(lastPushDate).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  return { commitsLast90Days, longestStreak, daysSinceLastPush };
}

export function score(repos: GitHubRepo[], events: GitHubEvent[]): { score: number; reason: string } {
  const signals = extractSignals(repos, events);

  const commitScore = normalize(signals.commitsLast90Days, 0, 200, 8);
  const streakScore = normalize(signals.longestStreak, 0, 30, 6);

  let recencyScore = 6;
  if (signals.daysSinceLastPush <= 7) recencyScore = 6;
  else if (signals.daysSinceLastPush <= 30) recencyScore = 4;
  else if (signals.daysSinceLastPush <= 90) recencyScore = 2;
  else recencyScore = 0;

  const total = commitScore + streakScore + recencyScore;

  const parts: string[] = [];
  if (signals.commitsLast90Days > 0) parts.push(`${signals.commitsLast90Days} commits in 90 days`);
  if (signals.longestStreak > 0) parts.push(`${signals.longestStreak}-day streak`);
  if (signals.daysSinceLastPush <= 7) parts.push('active this week');
  else if (signals.daysSinceLastPush > 30) parts.push(`last push ${signals.daysSinceLastPush}d ago`);

  return {
    score: Math.min(20, total),
    reason: parts.length > 0 ? parts.join(', ') : 'No recent activity detected',
  };
}
