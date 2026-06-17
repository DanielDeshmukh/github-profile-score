import { describe, it, expect } from 'vitest';
import type { RepoCommitCount } from '../../src/types/insights.js';

describe('InsightFetcher types', () => {
  it('should have correct RepoCommitCount shape', () => {
    const item: RepoCommitCount = {
      repoName: 'test-repo',
      repoUrl: 'https://github.com/testuser/test-repo',
      commitCount: 50,
      pushedAt: '2024-06-01T00:00:00Z',
    };
    expect(item).toHaveProperty('repoName');
    expect(item).toHaveProperty('repoUrl');
    expect(item).toHaveProperty('commitCount');
    expect(item).toHaveProperty('pushedAt');
  });
});
