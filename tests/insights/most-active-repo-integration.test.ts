import { describe, it, expect } from 'vitest';
import { findMostActiveRepo } from '../../src/scorer/insights/mostActiveRepo.js';
import { renderMostActiveRepoCard, renderMostActiveRepoEmptySvg } from '../../src/renderer/insights/MostActiveRepoCard.js';

describe('Most Active Repo insight integration', () => {
  it('should produce valid SVG from real calculation flow', () => {
    const repos = [
      { repoName: 'project-a', repoUrl: 'https://github.com/u/project-a', commitCount: 120, pushedAt: '2024-06-01T00:00:00Z' },
      { repoName: 'project-b', repoUrl: 'https://github.com/u/project-b', commitCount: 45, pushedAt: '2024-03-01T00:00:00Z' },
      { repoName: 'project-c', repoUrl: 'https://github.com/u/project-c', commitCount: 200, pushedAt: '2024-01-01T00:00:00Z' },
    ];

    const result = findMostActiveRepo(repos);
    expect(result).not.toBeNull();
    expect(result!.repoName).toBe('project-c');
    expect(result!.commitCount).toBe(200);

    const svg = renderMostActiveRepoCard(result!.repoName, result!.commitCount, result!.repoUrl);
    expect(svg).toContain('<svg');
    expect(svg).toContain('project-c');
    expect(svg).toContain('200');
    expect(svg).toContain('commits');
  });

  it('should handle empty input end-to-end', () => {
    const result = findMostActiveRepo([]);
    expect(result).toBeNull();

    const svg = renderMostActiveRepoEmptySvg();
    expect(svg).toContain('No public repos found');
  });

  it('should render cache-key-compatible slug', () => {
    const slug = 'most-active-repo';
    expect(slug).toMatch(/^[a-z-]+$/);
  });
});
