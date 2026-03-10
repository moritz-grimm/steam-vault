# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Fixed

- Crash when backing up screenshots from removed or split Steam games (e.g. GTA 5, app ID 218)
- Application hanging during EXIF metadata writing when processing multiple files simultaneously
- Screenshots being re-uploaded on every run due to hash mismatch after EXIF modification
- Log messages appearing in the compiled executable (SteamVault.exe) output

## 1.0.1 - 2026-03-08

### Changed

- Add tsup build step for npm publishing
- Add custom icon for executable

### Removed

- Remove daily log rotation from README feature list

## 1.0.0 - 2026-03-08

### Added

- Full backup flow: scan Steam screenshot folders, deduplicate via SHA-256 hashing, write EXIF metadata, and upload to Microsoft OneDrive
- Microsoft device code authentication via MSAL with silent token renewal
- Steam screenshot directory autodetection from Windows registry with fallback paths
- Game title resolution from the Steam Store API with in-memory + disk caching
- Concurrent uploads (up to 5 in parallel) with a CLI progress bar
- Dry-run mode (`--dry-run`) to preview uploads without making changes
- Debug mode (`--debug`) to disable console clearing for easier troubleshooting
- EXIF `DateTimeOriginal` injection so screenshots sort by capture date in OneDrive
- Customizable OneDrive upload location (base folder and root path)
- Interactive TUI menus powered by Inquirer.js
- Upload retry logic (up to 3 attempts with backoff)
- Daily log rotation via `winston-daily-rotate-file`
- GitHub Actions CI for linting, type checking, and tests
- Vitest test suite
- Husky pre-commit hooks (lint + typecheck via lint-staged)
