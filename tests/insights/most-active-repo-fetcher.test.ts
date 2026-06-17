import { describe, it, expect } from 'vitest';
import type { RepoCommitCount } from '../../src/types/insights.js';

function createMockRepoCommitCount(overrides: Partial<RepoCommitCount> = {}): RepoCommitCount {
  return {
    repoName: 'test-repo',
    repoUrl: 'https://github.com/testuser/test-repo',
    commitCount: 50,
    pushedAt: '2024-06-01T00:00:00Z',
    ...overrides,
  };
}

describe('MostActiveRepoFetcher types', () => {
  it('should have correct shape', () => {
    const item = createMockRepoCommitCount();
    expect(item).toHaveProperty('repoName');
    expect(item).toHaveProperty('repoUrl');
    expect(item).toHaveProperty('commitCount');
    expect(item).toHaveProperty('pushedAt');
  });

  it('should accept override values', () => {
    const item = createMockRepoCommitCount({ commitCount: 200, repoName: 'other-repo' });
    expect(item.commitCount).toBe(200);
    expect(item.repoName).toBe('other-repo');
  });
});
