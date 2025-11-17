// Functions for creating and managing diff icon elements

import type { PRInfo } from "./types";

// Create diff icon element
export const createDiffIcon = (commitSHA: string, latestSHA: string, prInfo: PRInfo): HTMLAnchorElement => {
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

