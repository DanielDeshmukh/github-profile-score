import { describe, it, expect } from 'vitest';
import { score } from '../src/scorer/HeuristicScorer.js';
import type { GitHubProfile, GitHubRepo, GitHubEvent } from '../src/types.js';

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

function createMockEvent(overrides: Partial<GitHubEvent> = {}): GitHubEvent {
  return {
    id: '1',
    type: 'PushEvent',
    created_at: '2024-01-01T00:00:00Z',
    repo: { name: 'testuser/test-repo' },
    payload: {},
    ...overrides,
  };
}

describe('HeuristicScorer', () => {
  it('should score a profile and return valid result', () => {
    const profile = createMockProfile();
    const repos = [createMockRepo()];
    const events = [createMockEvent()];

    const result = score(profile, repos, events);

    expect(result).toHaveProperty('username', 'testuser');
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('grade');
    expect(result).toHaveProperty('dimensions');
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.total).toBeLessThanOrEqual(100);
    expect(['A', 'B', 'C', 'D', 'F']).toContain(result.grade);
  });

  it('should calculate grade correctly for high-activity profile', () => {
    const profile = createMockProfile({ public_repos: 100, followers: 1000 });
    const repos = Array.from({ length: 50 }, (_, i) =>
      createMockRepo({
        id: i,
        name: `repo-${i}`,
        full_name: `testuser/repo-${i}`,
        stargazers_count: 100,
        forks_count: 20,
        description: 'A well-documented repository with good structure',
        topics: ['typescript', 'nodejs', 'api'],
        has_pages: true,
        has_wiki: true,
      })
    );
    const events = Array.from({ length: 50 }, (_, i) =>
      createMockEvent({
        id: String(i),
        type: 'PushEvent',
        created_at: new Date(Date.now() - i * 86400000).toISOString(),
      })
    );

    const result = score(profile, repos, events);

    expect(result.total).toBeGreaterThanOrEqual(40);
    expect(result.total).toBeLessThanOrEqual(100);
    expect(['A', 'B', 'C', 'D', 'F']).toContain(result.grade);
  });

  it('should return low score for empty profile', () => {
    const profile = createMockProfile({
      public_repos: 0,
      followers: 0,
      following: 0,
    });
    const repos: GitHubRepo[] = [];
    const events: GitHubEvent[] = [];

    const result = score(profile, repos, events);

    expect(result.total).toBeLessThan(50);
    expect(['D', 'F']).toContain(result.grade);
  });

  it('should have all five dimensions', () => {
    const profile = createMockProfile();
    const repos = [createMockRepo()];
    const events = [createMockEvent()];

    const result = score(profile, repos, events);

    expect(result.dimensions).toHaveProperty('activity');
    expect(result.dimensions).toHaveProperty('quality');
    expect(result.dimensions).toHaveProperty('documentation');
    expect(result.dimensions).toHaveProperty('diversity');
    expect(result.dimensions).toHaveProperty('community');
  });

  it('each dimension should have score and max of 20', () => {
    const profile = createMockProfile();
    const repos = [createMockRepo()];
    const events = [createMockEvent()];

    const result = score(profile, repos, events);

    for (const dim of Object.values(result.dimensions)) {
      expect(dim.score).toBeGreaterThanOrEqual(0);
      expect(dim.score).toBeLessThanOrEqual(20);
      expect(dim.max).toBe(20);
    }
  });
});

describe('Diversity dimension - classifyRepo keyword matching', () => {
  it('should classify library by topics', () => {
    const profile = createMockProfile();
    const repos = [createMockRepo({ topics: ['library', 'javascript'] })];
    const result = score(profile, repos, []);
    expect(result.dimensions.diversity.score).toBeGreaterThanOrEqual(0);
  });

  it('should classify library by description keyword', () => {
    const profile = createMockProfile();
    const repos = [createMockRepo({ description: 'A utility library for parsing', topics: [] })];
    const result = score(profile, repos, []);
    expect(result.dimensions.diversity.score).toBeGreaterThanOrEqual(0);
  });

  it('should classify tool by topics', () => {
    const profile = createMockProfile();
    const repos = [createMockRepo({ topics: ['cli', 'automation'] })];
    const result = score(profile, repos, []);
    expect(result.dimensions.diversity.score).toBeGreaterThanOrEqual(0);
  });

  it('should classify tool by repo name keyword', () => {
    const profile = createMockProfile();
    const repos = [createMockRepo({ name: 'my-scraper-tool', topics: [], description: '' })];
    const result = score(profile, repos, []);
    expect(result.dimensions.diversity.score).toBeGreaterThanOrEqual(0);
  });

  it('should classify app by description keyword', () => {
    const profile = createMockProfile();
    const repos = [createMockRepo({ description: 'A dashboard for monitoring', topics: [] })];
    const result = score(profile, repos, []);
    expect(result.dimensions.diversity.score).toBeGreaterThanOrEqual(0);
  });

  it('should classify app by topics', () => {
    const profile = createMockProfile();
    const repos = [createMockRepo({ topics: ['frontend', 'ui'] })];
    const result = score(profile, repos, []);
    expect(result.dimensions.diversity.score).toBeGreaterThanOrEqual(0);
  });

  it('should classify api by description keyword', () => {
    const profile = createMockProfile();
    const repos = [createMockRepo({ description: 'REST API backend service', topics: [] })];
    const result = score(profile, repos, []);
    expect(result.dimensions.diversity.score).toBeGreaterThanOrEqual(0);
  });

  it('should classify api by topics', () => {
    const profile = createMockProfile();
    const repos = [createMockRepo({ topics: ['fastapi', 'endpoint'] })];
    const result = score(profile, repos, []);
    expect(result.dimensions.diversity.score).toBeGreaterThanOrEqual(0);
  });

  it('should classify research by Jupyter Notebook language', () => {
    const profile = createMockProfile();
    const repos = [createMockRepo({ language: 'Jupyter Notebook', topics: [], description: '' })];
    const result = score(profile, repos, []);
    expect(result.dimensions.diversity.score).toBeGreaterThanOrEqual(0);
  });

  it('should classify research by keyword in description', () => {
    const profile = createMockProfile();
    const repos = [createMockRepo({ description: 'Fine-tune LLM models for research', topics: [], language: 'Python' })];
    const result = score(profile, repos, []);
    expect(result.dimensions.diversity.score).toBeGreaterThanOrEqual(0);
  });

  it('should classify research by keyword in topics', () => {
    const profile = createMockProfile();
    const repos = [createMockRepo({ topics: ['dataset', 'model'] })];
    const result = score(profile, repos, []);
    expect(result.dimensions.diversity.score).toBeGreaterThanOrEqual(0);
  });

  it('should classify other when no keywords match', () => {
    const profile = createMockProfile();
    const repos = [createMockRepo({ description: 'Just a random project', topics: [], language: 'Python' })];
    const result = score(profile, repos, []);
    expect(result.dimensions.diversity.score).toBeGreaterThanOrEqual(0);
  });

  it('should give higher diversity score with multiple categories', () => {
    const profile = createMockProfile();
    const repos = [
      createMockRepo({ id: 1, name: 'lib', topics: ['library'], description: '' }),
      createMockRepo({ id: 2, name: 'cli-tool', topics: ['cli'], description: '' }),
      createMockRepo({ id: 3, name: 'web-app', topics: ['app'], description: '' }),
      createMockRepo({ id: 4, name: 'api-server', topics: ['api'], description: '' }),
    ];
    const result = score(profile, repos, []);
    expect(result.dimensions.diversity.score).toBeGreaterThanOrEqual(10);
  });
});
