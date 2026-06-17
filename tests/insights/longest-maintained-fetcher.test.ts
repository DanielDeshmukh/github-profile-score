import { describe, it, expect } from 'vitest';
import type { RepoCommitSpan } from '../../src/types/insights.js';

describe('LongestMaintainedFetcher types', () => {
  it('should have correct RepoCommitSpan shape', () => {
    const span: RepoCommitSpan = {
      repoName: 'my-repo',
      repoUrl: 'https://github.com/u/my-repo',
      firstCommitDate: '2020-01-01T00:00:00Z',
      lastCommitDate: '2024-06-01T00:00:00Z',
      spanDays: 1612,
    };
    expect(span).toHaveProperty('repoName');
    expect(span).toHaveProperty('repoUrl');
    expect(span).toHaveProperty('firstCommitDate');
    expect(span).toHaveProperty('lastCommitDate');
    expect(span).toHaveProperty('spanDays');
  });
});
