# SteamVault

Automatically backup your Steam screenshots to OneDrive.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-green.svg)](https://nodejs.org/)

## Features

- **Automatic screenshot detection** - finds your Steam screenshot directory via the Windows registry
- **Deduplication** - SHA-256 hashing prevents duplicate uploads
- **EXIF metadata injection** - writes `DateTimeOriginal` so photos sort correctly in OneDrive
- **Concurrent uploads** - uploads up to 5 screenshots in parallel with a progress bar
- **Game title resolution** - organizes screenshots into folders named after the game (via the Steam Store API)
- **Game title caching** - caches API lookups to disk so subsequent runs are faster
- **Dry-run mode** - preview what would be uploaded without making any changes

## Prerequisites

- **Windows** (requires `%APPDATA%` and the Windows registry for Steam path detection)
- **Node.js** ≥ 20
- **Steam** installed with at least one screenshot taken
- **Microsoft account** with OneDrive access

## Installation

```bash
npm install -g steam-vault
```

## Quick Start

1. Run `steamvault` in your terminal.
2. On first launch you'll be prompted to authenticate with Microsoft using a device code - open the URL shown in your browser and enter the code.
3. SteamVault tries to auto-detect your screenshot directory. If it can't find it, you'll be prompted to enter the path manually. It should point to the `760/remote` folder inside your Steam `userdata` directory, e.g. `C:/Program Files (x86)/Steam/userdata/12345678/760/remote`.
4. Select **Backup Screenshots** from the main menu.

## CLI Flags

| Flag        | Description                                            |
| ----------- | ------------------------------------------------------ |
| `--debug`   | Disable console clearing for easier debugging          |
| `--dry-run` | Show what would be uploaded without actually uploading |
| `--version` | Print the version number and exit                      |
| `--help`    | Show help                                              |

## Configuration

SteamVault stores its config at:

```text
%APPDATA%/SteamVault/steamvault.config.json
```

| Key                   | Description                                                             |
| --------------------- | ----------------------------------------------------------------------- |
| `screenshotDirectory` | Path to the Steam `760/remote` screenshots folder                       |
| `oneDriveBaseFolder`  | Name of the top-level folder in OneDrive (default: `SteamVault`)        |
| `oneDriveRootPath`    | OneDrive API root path (default: `special/photos` - your Photos folder) |
| `entraClientId`       | Microsoft Entra application (client) ID                                 |
| `gameTitleCache`      | Path to the game title cache file                                       |
| `screenshotHashes`    | Path to the screenshot hash file                                        |
| `msalCache`           | Path to the MSAL authentication token cache                             |
| `logDirPath`          | Directory for log files                                                 |
| `backupPath`          | Temporary directory for EXIF backup copies                              |

Path values support the `%APPDATA%` placeholder, which is resolved at runtime.

## Authentication

SteamVault uses the **Microsoft device code flow**:

1. On first run the app displays a URL and a one-time code.
2. Open the URL in any browser, sign in with your Microsoft account, and enter the code.
3. Tokens are cached locally at `%APPDATA%/SteamVault/msal.cache.json` - subsequent runs authenticate silently.

To log out, select **Account => Logout** from the main menu. This clears the token cache.

## How It Works

```text
Scan screenshot folders
        ↓
Resolve game titles (Steam API + cache)
        ↓
Hash each file (SHA-256)
        ↓
Skip already-uploaded duplicates
        ↓
Write EXIF metadata (DateTimeOriginal)
        ↓
Upload to OneDrive (up to 5 concurrent)
        ↓
Persist hash file to OneDrive
```

## OneDrive Structure

Screenshots are uploaded to your OneDrive Photos folder by default:

```text
OneDrive/
└── Photos/
    └── SteamVault/
        ├── Counter-Strike 2/
        │   ├── 20240115120000_1.jpg
        │   └── 20240115120001_1.jpg
        ├── Half-Life 2/
        │   └── 20240201143000_1.jpg
        └── screenshot.hashes.json
```

The base folder and root path are configurable in settings.

## Troubleshooting

**No screenshots found**

- Make sure your screenshot directory is set correctly. Go to **Settings => Set Screenshot Directory**.
- The directory should point to the `760/remote` folder  
inside your Steam `userdata` directory (e.g. `C:/Program Files (x86)/Steam/userdata/12345678/760/remote`).

**Authentication failure**

- Check your internet connection.
- Try logging out (**Account => Logout**) and logging back in.
- If the device code expires, restart the app to get a new code.

**APPDATA not set**

- SteamVault requires the `%APPDATA%` environment variable. This is set by default on Windows. If missing, set it manually or run from a standard Windows terminal.

**Upload failures**

- Uploads are retried up to 3 times automatically.
- Check the log files at `%APPDATA%/SteamVault/logs` for detailed error information.
- Ensure your OneDrive has sufficient storage space.

## Roadmap

- **Additional cloud providers** - support for Google Drive, Dropbox, and others beyond OneDrive
- **Remote hash sync** - compare remote and local hash files for portability across machines
- **Partial backup** - upload screenshots from selected games only
- **Steam background recordings** - back up video recordings in addition to screenshots
- **Configurable upload concurrency** - adjust the number of parallel uploads
- **Multi-user support** - handle multiple Steam user profiles
- **Scriptable CLI** - additional flags for non-interactive automation

## Development

```bash
# Install dependencies
npm install

# Run in development mode (enables --debug flag)
npm run dev

# Lint
npm run lint
npm run lint:fix

# Type check
npm run typecheck

# Run tests
npm test

# Build standalone executable (requires Bun)
npm run build
```

## Disclaimer

This project is not affiliated with, endorsed by, or associated with Valve Corporation or Steam. "Steam" is a trademark of Valve Corporation. All trademarks are the property of their respective owners.

## License

[MIT](LICENSE)
