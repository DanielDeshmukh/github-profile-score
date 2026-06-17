export interface RepoCommitCount {
  repoName: string;
  repoUrl: string;
  commitCount: number;
  pushedAt: string;
}

export interface RepoCommitSpan {
  repoName: string;
  repoUrl: string;
  firstCommitDate: string;
  lastCommitDate: string;
  spanDays: number;
}
