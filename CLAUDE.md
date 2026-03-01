# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SteamVault is a TypeScript CLI application that backs up Steam screenshots to Microsoft OneDrive. It authenticates via Microsoft device code flow, scans local Steam screenshot directories, deduplicates via SHA-256 hashing, injects EXIF metadata, and uploads to OneDrive via Microsoft Graph API.

## Commands

- `npm run dev` — Run in development mode (enables `--debug` flag, shows console logs)
- `npm run prod` — Run in production mode (suppresses console output)
- `npm run lint` — ESLint check
- `npm run lint:fix` — ESLint auto-fix
- `npm run typecheck` — TypeScript type checking (`tsc --noEmit`)
- `npm run build` — Compile to standalone executable via Bun

No test framework is configured.

## Tech Stack

- **TypeScript** (strict mode, ESNext target, ES modules)
- **Runtime:** Node.js via tsx; Bun for compilation only
- **Key deps:** @azure/msal-node (auth), @inquirer/prompts (interactive menus), commander (CLI args), axios (HTTP), winston (logging), exiftool-vendored (EXIF writing), @dotenvx/dotenvx (encrypted env vars)

## Architecture

### Entry & Initialization Flow

`src/steamvault.ts` → loads encrypted env vars → `initializeApp()` → `printMainMenu(ctx)`

`initializeApp()` in `src/initialize-app.ts` creates `%APPDATA%/SteamVault` directories, loads config from disk, instantiates all services with explicit constructor dependency injection, runs Microsoft auth, and returns an `AppContext`.

### AppContext Pattern

All services are wired together at startup and passed through `AppContext` (defined in `src/app-context.ts`). Menus and operations receive this context — no global singletons except `ConfigService` which uses a static factory (`ConfigService.create()`).

### Service Layer (`src/api/`, `src/auth/`)

- `OneDriveService` — Microsoft Graph API file uploads
- `SteamApiService` — Fetches game titles from Steam Store API
- `GameTitleCache` — In-memory + disk cache for game title lookups
- `AuthService` (`src/auth/ms-auth.ts`) — MSAL device code authentication

### Backup Flow (`src/backup-service.ts`)

Full backup: scan screenshot folders → resolve game titles → hash files (SHA-256) → skip duplicates → write EXIF metadata → upload to OneDrive. Uses `Promise.allSettled()` for fault-tolerant batch processing.

### UI Layer (`src/ui/`)

Interactive menus using Inquirer.js with `while(running)` state-machine loops. `console.clear()` between menu renders (disabled in `--debug` mode).

### Config & Environment

- Config file: `%APPDATA%/SteamVault/steamvault.config.json` (managed by `ConfigService` in `src/config-service.ts`)
- Environment vars: encrypted in `.env` via dotenvx, decryption keys in `.env.keys`
- Path placeholders like `%APPDATA%` are substituted at runtime

### Import Paths

Uses baseUrl `.` in tsconfig — imports use `src/` prefix (e.g., `import { foo } from "src/utils/logger"`).
