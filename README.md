# GitHub PR Diff Extension

A browser extension (Firefox & Chrome) that adds diff icons next to commit hashes on GitHub pull request pages, allowing you to quickly view the diff between any commit and the latest commit in the PR.

## Features

- Automatically detects GitHub pull request pages
- Adds 🔀 diff icons next to commit hashes (for older commits)
- Adds ⭐ star icon next to the latest commit (indicating no diff available)
- Click a 🔀 icon to open a new tab with the diff between that commit and the latest commit
- Works with dynamically loaded content (GitHub's infinite scroll)
- Clean, unobtrusive UI integration

## Installation

### Firefox

#### Temporary Installation (for development/testing)

1. Build the extension first:
   ```bash
   pnpm install
   pnpm run build
   ```

2. Open Firefox and navigate to `about:debugging`
3. Click on "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on..."
5. Navigate to this directory and select the `manifest.json` file
6. The extension should now appear in your extensions list and toolbar

#### Permanent Installation

1. Build the extension:
   ```bash
   pnpm install
   pnpm run build
   ```

2. Package the extension:
   ```bash
   zip -r github-pr-diff-extension.xpi . -x "*.git*" "*.md" "node_modules/*" "src/*" "build-ts/*" "*.xpi" "*.zip" "pnpm-lock.yaml" "tsconfig.json" "package.json" "biome.json" "hooks/*"
   ```

3. In Firefox, go to `about:addons`
4. Click the gear icon and select "Install Add-on From File..."
5. Select the `github-pr-diff-extension.xpi` file

### Chrome / Chromium / Edge

#### Developer Mode Installation

1. Build the extension first:
   ```bash
   pnpm install
   pnpm run build
   ```

2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top right)
4. Click "Load unpacked"
5. Navigate to this directory and select it
6. The extension should now appear in your extensions list

#### Packaged Installation

1. Build the extension:
   ```bash
   pnpm install
   pnpm run build
   ```

2. Package the extension:
   ```bash
   zip -r github-pr-diff-extension.zip . -x "*.git*" "*.md" "node_modules/*" "src/*" "build-ts/*" "*.xpi" "*.zip" "pnpm-lock.yaml" "tsconfig.json" "package.json" "biome.json" "hooks/*"
   ```

3. In Chrome, go to `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked" and select the extracted folder, OR
6. Drag and drop the `.zip` file onto the extensions page (Chrome will extract it)

## Usage

1. Navigate to any GitHub pull request page (e.g., `https://github.com/owner/repo/pull/123`)
2. You'll see icons appear next to commit hashes throughout the page:
   - 🔀 icons next to older commits (clickable, opens diff)
   - ⭐ icon next to the latest commit (indicates no diff available)
3. Click any 🔀 icon to open a new tab showing the diff between that commit and the latest commit in the PR
4. The diff opens in GitHub's PR files view: `https://github.com/owner/repo/pull/{PR_NUMBER}/files/{commit}..{latest}`

## Development

### Prerequisites

- Node.js (v18 or higher)
- pnpm (install with `npm install -g pnpm`)

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd github_extension
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build the extension:
   ```bash
   pnpm run build
   ```

### Development Scripts

- `pnpm run build` - Type check TypeScript and bundle with esbuild
- `pnpm run watch` - Watch TypeScript files for changes (type checking only)
- `pnpm run check` - Run Biome linter
- `pnpm run check:write` - Run Biome linter and auto-fix issues
- `pnpm run format` - Format code with Biome

### Project Structure

```
github_extension/
├── src/                    # TypeScript source files
│   ├── content.ts         # Main content script
│   ├── popup.ts            # Popup script
│   ├── types.ts            # Type definitions
│   ├── utils.ts            # Utility functions (URL parsing, page detection)
│   ├── commit-finder.ts    # Commit finding logic
│   └── diff-icon.ts        # Icon creation and management
├── build/                  # Compiled and bundled JavaScript (generated)
│   ├── content.js          # Bundled content script
│   └── popup.js             # Bundled popup script
├── hooks/                  # Git hooks
│   └── pre-commit          # Pre-commit hook for Biome linting
├── icons/                  # Extension icons
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   └── icon-128.png
├── manifest.json           # Extension configuration
├── popup.html              # Popup UI
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── biome.json              # Biome linter/formatter configuration
├── LICENSE                 # MIT License
└── README.md               # This file
```

### Code Quality

The project uses:
- **TypeScript** for type safety
- **Biome** for linting and formatting
- **esbuild** for fast bundling
- **Pre-commit hook** that runs Biome checks before commits

To set up the pre-commit hook (if cloning the repo):
```bash
cp hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Building

The build process:
1. Type checks TypeScript files with `tsc --noEmit`
2. Bundles TypeScript source files with esbuild into `build/` directory
3. Outputs browser-compatible IIFE bundles

The `build/` directory contains the files used by the browser extension.

## Testing

1. After building and installation, navigate to a GitHub pull request page
2. Look for commit hashes - you should see:
   - 🔀 icons next to older commits
   - ⭐ icon next to the latest commit
3. Click a 🔀 icon to verify it opens the diff in a new tab
4. Click the extension icon in your toolbar to see the popup with usage instructions

## How It Works

The extension uses a content script that:
1. Detects when you're on a GitHub pull request page
2. Scans the page for commit hashes (40-character SHA values inside `<code>` tags)
3. Identifies the latest commit in the PR using multiple fallback methods
4. Injects icons next to each commit hash:
   - 🔀 diff icon for older commits (clickable, opens diff)
   - ⭐ star icon for the latest commit (non-clickable, indicates no diff)
5. When a 🔀 icon is clicked, opens a GitHub compare URL showing the diff

The extension uses a MutationObserver to handle GitHub's dynamically loaded content, so it works even with infinite scroll and AJAX-loaded commits. It also runs periodically to catch late-loading content.

## Technical Details

- **Manifest V3** compatible (works on both Firefox and Chrome)
- **TypeScript** for type safety and better developer experience
- **Modular architecture** with separate files for different concerns
- Uses content scripts to modify GitHub pages
- Requires `tabs` permission to open new tabs
- Requires `host_permissions` for `https://github.com/*`
- Cross-browser compatible (handles both `browser` and `chrome` APIs)
- Uses esbuild for fast bundling with tree-shaking

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
