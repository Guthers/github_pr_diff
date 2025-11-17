# GitHub PR Diff Extension

A Firefox extension that adds diff icons next to commit hashes on GitHub pull request pages, allowing you to quickly view the diff between any commit and the latest commit in the PR.

## Features

- Automatically detects GitHub pull request pages
- Adds 🔀 diff icons next to commit hashes
- Click an icon to open a new tab with the diff between that commit and the latest commit
- Works with dynamically loaded content (GitHub's infinite scroll)
- Clean, unobtrusive UI integration

## Installation

### Temporary Installation (for development/testing)

1. Open Firefox and navigate to `about:debugging`
2. Click on "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on..."
4. Navigate to this directory and select the `manifest.json` file
5. The extension should now appear in your extensions list and toolbar

### Permanent Installation (for distribution)

1. Package the extension:
   ```bash
   zip -r github-pr-diff-extension.zip . -x "*.git*" "*.md" "generate_icons.py"
   ```

2. In Firefox, go to `about:addons`
3. Click the gear icon and select "Install Add-on From File..."
4. Select the `github-pr-diff-extension.zip` file

## Usage

1. Navigate to any GitHub pull request page (e.g., `https://github.com/owner/repo/pull/123`)
2. You'll see 🔀 icons appear next to commit hashes throughout the page
3. Click any 🔀 icon to open a new tab showing the diff between that commit and the latest commit in the PR
4. The diff opens in GitHub's compare view: `https://github.com/owner/repo/compare/{commit}...{latest}`

## Testing

1. After installation, navigate to a GitHub pull request page
2. Look for commit hashes - you should see 🔀 icons next to them
3. Click a 🔀 icon to verify it opens the diff in a new tab
4. Click the extension icon in your toolbar to see the popup with usage instructions

## File Structure

```
github_extension/
├── manifest.json      # Extension configuration
├── content.js         # Content script that adds diff icons to GitHub PR pages
├── popup.html         # Popup UI
├── popup.js           # Popup functionality
├── icons/             # Extension icons
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   └── icon-128.png
├── generate_icons.py  # Script to generate icons
├── LICENSE            # MIT License
└── README.md          # This file
```

## Development

To regenerate icons, run:
```bash
python3 generate_icons.py
```

## How It Works

The extension uses a content script that:
1. Detects when you're on a GitHub pull request page
2. Scans the page for commit hashes (40-character SHA values)
3. Identifies the latest commit in the PR
4. Injects 🔀 icons next to each commit hash (except the latest)
5. When clicked, opens a GitHub compare URL showing the diff

The extension uses a MutationObserver to handle GitHub's dynamically loaded content, so it works even with infinite scroll and AJAX-loaded commits.

## Technical Details

- **Manifest V3** compatible
- Uses content scripts to modify GitHub pages
- Requires `tabs` permission to open new tabs
- Requires `host_permissions` for `https://github.com/*`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
