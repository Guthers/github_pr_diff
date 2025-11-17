// Utility functions for URL parsing and page detection

import type { PRInfo } from "./types";

// Check if we're on a GitHub PR page
export const isPRPage = (): boolean => {
  return window.location.pathname.match(/^\/[^\/]+\/[^\/]+\/pull\/\d+/) !== null;
};

// Extract owner, repo, and PR number from URL
export const getPRInfo = (): PRInfo | null => {
  const match = window.location.pathname.match(
    /^\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/
  );
  if (match) {
    return {
      owner: match[1],
      repo: match[2],
      prNumber: match[3]
    };
  }
  return null;
};

// Extract SHA from various GitHub commit URL patterns
export const extractSHAFromHref = (href: string | null): string | null => {
  if (!href) return null;
  // Match patterns like:
  // - /commit/SHA (singular)
  // - /commits/SHA (plural, used in PR pages)
  // - /pull/NUMBER/commits/SHA (PR commit links)
  const patterns = [
    /\/commits?\/([a-f0-9]{40})/, // Matches both /commit/ and /commits/
    /\/pull\/\d+\/commits\/([a-f0-9]{40})/ // PR-specific pattern
  ];

  for (const pattern of patterns) {
    const match = href.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
};

