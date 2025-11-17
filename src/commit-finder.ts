// Functions for finding and identifying commit elements on the page

import type { CommitElement } from "./types";
import { extractSHAFromHref } from "./utils";

// Get the latest commit SHA from the PR page
export const getLatestCommitSHA = (): string | null => {
  // Method 1: Look for the PR head commit in the page header/metadata
  // GitHub often shows the latest commit SHA in the PR header
  const prHeader = document.querySelector(
    '.gh-header-meta, .commit-tease, [data-test-selector="pr-header-actions"], .gh-header-actions'
  );
  if (prHeader) {
    const headerLinks = Array.from(prHeader.querySelectorAll('a[href*="/commit"]'));
    for (const link of headerLinks) {
      const href = link.getAttribute("href");
      const sha = extractSHAFromHref(href);
      if (sha) {
        return sha;
      }
    }
  }

  // Method 2: Find commits in the timeline/commits list
  // GitHub shows commits in chronological order, newest first
  // Look for both /commit/ and /commits/ patterns
  const allCommitLinks = Array.from(document.querySelectorAll('a[href*="/commit"]'));
  const seenSHAs = new Set<string>();
  const commitsInTimeline: CommitElement[] = [];

  for (const link of allCommitLinks) {
    const href = link.getAttribute("href");
    const sha = extractSHAFromHref(href);
    if (sha) {
      if (!seenSHAs.has(sha)) {
        seenSHAs.add(sha);
        // Check if this is in the commits list/timeline
        const inCommitsList = link.closest(
          '.TimelineItem, .commit-group, [data-test-selector="pr-timeline-commits-list"], .js-navigation-item, [data-testid="pr-timeline-commits-list"]'
        );
        if (inCommitsList) {
          commitsInTimeline.push({ sha, element: link as HTMLAnchorElement });
        }
      }
    }
  }

  // Return the first commit in timeline (newest)
  if (commitsInTimeline.length > 0) {
    return commitsInTimeline[0].sha;
  }

  // Method 3: Fallback - get the first commit SHA found anywhere (if only one commit)
  if (seenSHAs.size === 1) {
    const firstSHA = Array.from(seenSHAs)[0];
    return firstSHA;
  }

  // Method 4: If multiple commits, try to find the one in the commits section
  if (allCommitLinks.length > 0) {
    // Look for commits section specifically
    const commitsSection = document.querySelector(
      '[data-testid="pr-timeline-commits-list"], .js-navigation-container, .TimelineItem--condensed'
    );
    if (commitsSection) {
      const sectionLinks =
        commitsSection.querySelectorAll('a[href*="/commit"]');
      if (sectionLinks.length > 0) {
        const href = sectionLinks[0].getAttribute("href");
        const sha = extractSHAFromHref(href);
        if (sha) {
          return sha;
        }
      }
    }

    // Last resort: use first commit link found
    const href = allCommitLinks[0].getAttribute("href");
    const sha = extractSHAFromHref(href);
    if (sha) {
      return sha;
    }
  }

  return null;
};

// Check if a link is a commit hash link (not a commit message link)
const isCommitHashLink = (link: Element): boolean => {
  // Commit hash links are ONLY the ones inside <code> tags
  // This ensures we don't match commit message links

  // Check if link is inside a code element - this is the definitive indicator
  const inCode = link.closest("code");
  if (inCode) {
    // Double-check: the link text should be a short SHA (7-12 chars)
    const linkText = link.textContent?.trim() ?? "";
    const href = link.getAttribute("href");
    const sha = extractSHAFromHref(href);

    if (sha && linkText.length <= 12) {
      // Verify the link text matches the beginning of the SHA
      if (sha.startsWith(linkText) || linkText === sha.substring(0, 7)) {
        return true;
      }
    }
  }

  return false;
};

// Find all commit hash elements on the page
export const findCommitHashes = (): CommitElement[] => {
  const commitHashes = new Map<string, HTMLAnchorElement>(); // Map SHA to element for deduplication
  const elements: CommitElement[] = [];

  // Find all commit links, but filter to only hash links (not message links)
  const allCommitLinks = document.querySelectorAll('a[href*="/commit"]');

  allCommitLinks.forEach((link) => {
    const href = link.getAttribute("href");
    const sha = extractSHAFromHref(href);

    if (sha && isCommitHashLink(link)) {
      // Only add if we haven't seen this SHA-element pair
      if (!commitHashes.has(sha) || commitHashes.get(sha) !== link) {
        commitHashes.set(sha, link as HTMLAnchorElement);
        elements.push({ sha, element: link as HTMLAnchorElement });
      }
    }
  });

  return elements;
};

