// Type definitions for the GitHub PR Diff Extension

export interface PRInfo {
  owner: string;
  repo: string;
  prNumber: string;
}

export interface CommitElement {
  sha: string;
  element: HTMLAnchorElement;
}

