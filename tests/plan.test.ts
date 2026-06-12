import { describe, it, expect } from 'vitest';
import { score } from '../src/scorer/HeuristicScorer.js';
import type { GitHubProfile, GitHubRepo, ScoreResult } from '../src/types.js';

function createMockProfile(overrides: Partial<GitHubProfile> = {}): GitHubProfile {
  return {
    login: 'testuser',
    name: 'Test User',
    bio: 'Developer',
    public_repos: 10,
    followers: 50,
    following: 25,
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    avatar_url: 'https://avatars.githubusercontent.com/u/1',
    html_url: 'https://github.com/testuser',
    company: null,
    blog: null,
    location: null,
    email: null,
    hireable: null,
    ...overrides,
  };
}

function createMockRepo(overrides: Partial<GitHubRepo> = {}): GitHubRepo {
  return {
    id: 1,
    name: 'test-repo',
    full_name: 'testuser/test-repo',
    description: 'A test repository',
    stargazers_count: 10,
    forks_count: 2,
    watchers_count: 5,
    language: 'TypeScript',
    topics: ['test'],
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    pushed_at: '2024-01-01T00:00:00Z',
    html_url: 'https://github.com/testuser/test-repo',
    fork: false,
    has_wiki: false,
    has_pages: false,
    open_issues_count: 0,
    license: { spdx_id: 'MIT' },
    ...overrides,
  };
}

function generatePlan(result: ScoreResult) {
  const improvements = (Object.entries(result.dimensions) as [string, { score: number; max: number; callout: string | null }][])
    .filter(([_, dim]) => dim.score < dim.max)
    .map(([dimension, dim]) => ({
      dimension,
      current_score: dim.score,
      max_score: dim.max,
      points_available: dim.max - dim.score,
      callout: dim.callout,
    }))
    .sort((a, b) => b.points_available - a.points_available)
    .map((item, index) => ({
      ...item,
      priority: index + 1,
    }));

  return {
    username: result.username,
    total: result.total,
    grade: result.grade,
    improvements,
  };
}

describe('Plan endpoint logic', () => {
  it('should sort improvements by points_available descending', async () => {
    const profile = createMockProfile();
    const repos = [
      createMockRepo({ id: 1, name: 'lib', topics: ['library'] }),
      createMockRepo({ id: 2, name: 'tool', topics: ['cli'] }),
      createMockRepo({ id: 3, name: 'app', topics: ['web'] }),
    ];
    const result = await score(profile, repos, []);
    const plan = generatePlan(result);

    for (let i = 1; i < plan.improvements.length; i++) {
      expect(plan.improvements[i - 1].points_available).toBeGreaterThanOrEqual(
        plan.improvements[i].points_available,
      );
    }
  });

  it('should calculate points_available correctly', async () => {
    const profile = createMockProfile();
    const repos = [createMockRepo()];
    const result = await score(profile, repos, []);
    const plan = generatePlan(result);

    for (const item of plan.improvements) {
      expect(item.points_available).toBe(item.max_score - item.current_score);
    }
  });

  it('should omit dimensions where score equals max', async () => {
    const profile = createMockProfile();
    const repos = [
      createMockRepo({ id: 1, name: 'lib', topics: ['library'] }),
      createMockRepo({ id: 2, name: 'tool', topics: ['cli'] }),
      createMockRepo({ id: 3, name: 'app', topics: ['web'] }),
      createMockRepo({ id: 4, name: 'api', topics: ['api'] }),
      createMockRepo({ id: 5, name: 'research', language: 'Jupyter Notebook' }),
    ];
    const result = await score(profile, repos, []);
    const plan = generatePlan(result);

    for (const item of plan.improvements) {
      expect(item.current_score).toBeLessThan(item.max_score);
    }
  });

  it('should have 1-indexed priority', async () => {
    const profile = createMockProfile();
    const repos = [createMockRepo()];
    const result = await score(profile, repos, []);
    const plan = generatePlan(result);

    expect(plan.improvements[0].priority).toBe(1);
    for (let i = 1; i < plan.improvements.length; i++) {
      expect(plan.improvements[i].priority).toBe(i + 1);
    }
  });

  it('should include dimension, current_score, max_score, points_available, callout', async () => {
    const profile = createMockProfile();
    const repos = [createMockRepo()];
    const result = await score(profile, repos, []);
    const plan = generatePlan(result);

    for (const item of plan.improvements) {
      expect(item).toHaveProperty('dimension');
      expect(item).toHaveProperty('current_score');
      expect(item).toHaveProperty('max_score');
      expect(item).toHaveProperty('points_available');
      expect(item).toHaveProperty('callout');
      expect(item).toHaveProperty('priority');
    }
  });

  it('should return empty improvements when all dimensions are maxed', () => {
    const result: ScoreResult = {
      username: 'testuser',
      total: 100,
      grade: 'A',
      dimensions: {
        activity: { score: 20, max: 20, callout: null, reason: '' },
        quality: { score: 20, max: 20, callout: null, reason: '' },
        documentation: { score: 20, max: 20, callout: null, reason: '' },
        diversity: { score: 20, max: 20, callout: null, reason: '' },
        community: { score: 20, max: 20, callout: null, reason: '' },
      },
      cached: false,
      cache_age_seconds: 0,
      scored_at: new Date().toISOString(),
    };
    const plan = generatePlan(result);

    expect(plan.improvements).toHaveLength(0);
  });
});
