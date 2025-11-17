"use strict";
document.addEventListener("DOMContentLoaded", () => {
    // Check if user is on a GitHub PR page
    // Use browser API (Firefox) or chrome API (Chrome/Edge)
    const browserAPI = typeof browser !== "undefined" ? browser : chrome;
    if (browserAPI && browserAPI.tabs) {
        browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] &&
                tabs[0].url &&
                tabs[0].url.includes("github.com") &&
                tabs[0].url.includes("/pull/")) {
                const info = document.querySelector(".info");
                if (info) {
                    info.innerHTML +=
                        '<p style="margin-top: 10px; color: #30e60b; font-weight: bold;">✓ You\'re on a PR page! Look for 🔀 icons next to commit hashes.</p>';
                }
            }
        });
    }
});
