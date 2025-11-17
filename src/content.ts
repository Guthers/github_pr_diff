// GitHub PR Diff Extension - Content Script
// Adds diff icons next to commit hashes on GitHub pull request pages

import { findCommitHashes, getLatestCommitSHA } from "./commit-finder";
import { createDiffIcon, createLatestCommitIcon } from "./diff-icon";
import { getPRInfo, isPRPage } from "./utils";

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
    // Check if this is the latest commit - add special icon
    if (sha === latestSHA) {
      // Skip if latest commit icon already added
      if (
        element.nextSibling &&
        element.nextSibling instanceof Element &&
        element.nextSibling.classList &&
        element.nextSibling.classList.contains("github-latest-icon")
      ) {
        return;
      }

      // Also check parent for existing latest icon
      if (element.parentElement) {
        const existingIcon = element.parentElement.querySelector(
          `.github-latest-icon[data-commit-sha="${sha}"]`
        );
        if (existingIcon) {
          return;
        }
      }

      // Add latest commit icon
      const icon = createLatestCommitIcon(sha);
      icon.setAttribute("data-commit-sha", sha);

      // Insert after the element
      if (element.parentElement) {
        element.parentElement.insertBefore(icon, element.nextSibling);
      }
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
