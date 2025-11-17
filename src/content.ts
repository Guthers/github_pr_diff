// GitHub PR Diff Extension - Content Script
// Adds diff icons next to commit hashes on GitHub pull request pages

(() => {
  "use strict";

  interface PRInfo {
    owner: string;
    repo: string;
    prNumber: string;
  }

  interface CommitElement {
    sha: string;
    element: HTMLAnchorElement;
  }

  // Check if we're on a GitHub PR page
  const isPRPage = (): boolean => {
    return window.location.pathname.match(/^\/[^\/]+\/[^\/]+\/pull\/\d+/) !== null;
  };

  // Extract owner, repo, and PR number from URL
  const getPRInfo = (): PRInfo | null => {
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
  const extractSHAFromHref = (href: string | null): string | null => {
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

  // Get the latest commit SHA from the PR page
  const getLatestCommitSHA = (): string | null => {
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
  const findCommitHashes = (): CommitElement[] => {
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

  // Create diff icon element
  const createDiffIcon = (commitSHA: string, latestSHA: string, prInfo: PRInfo): HTMLAnchorElement => {
    const icon = document.createElement("a");
    icon.href = "#";
    icon.className = "github-diff-icon";
    icon.title = `View diff between ${commitSHA.substring(0, 7)} and latest commit`;
    icon.innerHTML = "🔀";
    icon.style.cssText = `
      display: inline-block !important;
      margin-left: 6px !important;
      text-decoration: none !important;
      font-size: 16px !important;
      vertical-align: middle !important;
      opacity: 0.8 !important;
      transition: opacity 0.2s !important;
      cursor: pointer !important;
      line-height: 1 !important;
      position: relative !important;
      z-index: 1000 !important;
    `;

    icon.addEventListener("mouseenter", () => {
      icon.style.opacity = "1";
      icon.style.transform = "scale(1.2)";
    });

    icon.addEventListener("mouseleave", () => {
      icon.style.opacity = "0.8";
      icon.style.transform = "scale(1)";
    });

    icon.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Construct the diff URL for code review
      // Format: /pull/{PR_NUMBER}/files/{commitSHA}..{latestSHA}
      // This shows the files changed in the PR from a specific commit to the latest
      const diffUrl = `https://github.com/${prInfo.owner}/${prInfo.repo}/pull/${prInfo.prNumber}/files/${commitSHA}..${latestSHA}`;

      // Open in new tab
      window.open(diffUrl, "_blank");
    });

    return icon;
  };

  // Add diff icons to commit hashes
  const addDiffIcons = (): void => {
    if (!isPRPage()) {
      return;
    }

    const prInfo = getPRInfo();
    if (!prInfo) {
      return;
    }

    const latestSHA = getLatestCommitSHA();
    if (!latestSHA) {
      return;
    }

    const commitElements = findCommitHashes();

    commitElements.forEach(({ sha, element }) => {
      // Skip if this is the latest commit (no diff needed)
      if (sha === latestSHA) {
        return;
      }

      // Skip if icon already added to this specific element
      // Check if there's already an icon right after this element
      if (
        element.nextSibling &&
        element.nextSibling instanceof Element &&
        element.nextSibling.classList &&
        element.nextSibling.classList.contains("github-diff-icon")
      ) {
        return;
      }

      // Also check parent for existing icons
      if (element.parentElement) {
        const existingIcon = element.parentElement.querySelector(
          `.github-diff-icon[data-commit-sha="${sha}"]`
        );
        if (existingIcon) {
          return;
        }
      }

      // Add icon next to the commit element
      const icon = createDiffIcon(sha, latestSHA, prInfo);
      icon.setAttribute("data-commit-sha", sha); // Mark which commit this icon is for

      // Insert after the element
      if (element.parentElement) {
        // Insert right after the element
        element.parentElement.insertBefore(icon, element.nextSibling);
      }
    });
  };

  // Initialize the extension
  // Run on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(addDiffIcons, 2000); // Wait for GitHub's dynamic content
    });
  } else {
    setTimeout(addDiffIcons, 2000);
  }

  // Re-run when page content changes (GitHub uses dynamic loading)
  let observerTimeout: ReturnType<typeof setTimeout>;
  const observer = new MutationObserver(() => {
    // Debounce to avoid too many calls
    clearTimeout(observerTimeout);
    observerTimeout = setTimeout(() => {
      addDiffIcons();
    }, 500);
  });

  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Also run periodically to catch late-loading content
  setInterval(addDiffIcons, 5000);
})();

