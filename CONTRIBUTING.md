# Contributing to SteamVault

Thanks for your interest in contributing to SteamVault. This guide will help you get started.

## Prerequisites

- **Windows** (SteamVault relies on `%APPDATA%` and the Windows registry)
- **Node.js** >= 20
- **Steam** installed with at least one screenshot taken
- **Microsoft account** with OneDrive access (for end-to-end testing)

## Getting Started

1. Fork the repository and clone your fork:

   ```bash
   git clone https://github.com/<your-username>/steam-vault.git
   cd steam-vault
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run in development mode:

   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Strategy

- Create feature branches from `dev`
- Open pull requests against `dev`
- `dev` is periodically merged into `main` for releases
- Keep commits focused and atomic

### Running Checks

Before submitting a PR, make sure all checks pass locally:

```bash
# Lint (strict mode — zero warnings allowed)
npm run lint:strict

# Type check
npm run typecheck

# Run tests
npm test
```

These same checks run automatically via GitHub Actions on every pull request. Husky pre-commit hooks also run lint and typecheck on staged files.

### Code Style

- **TypeScript** in strict mode, no `any` unless absolutely necessary
- **ES modules** — use `import`/`export`, not `require`
- **Import paths** use the `src/` prefix (e.g., `import { foo } from "src/utils/logger"`)
- Follow existing patterns in the codebase, when in doubt, look at how similar code is structured

### Error Handling

- **Services** (`src/api/`, `src/auth/`): throw on failure, wrap errors with context
- **Callers** (`src/ui/`, `src/backup-service.ts`): catch errors, log via `logger.error()`, display via `printError()`
- Use `toError(err)` from `src/utils/error-utils.ts` to safely convert `unknown` catches

### User-Facing Output

Use the print functions from `src/utils/print.ts` instead of `console.log`:

- `print(message)` — plain output
- `printInfo(message)` — informational (cyan)
- `printSuccess(message)` — success (green)
- `printError(message)` — error (red)

## Submitting a Pull Request

1. Make sure all checks pass (`npm run lint:strict && npm run typecheck && npm test`)
2. Write a clear PR title and description explaining **what** changed and **why**
3. Keep PRs focused - one feature or fix per PR
4. Update the [CHANGELOG](CHANGELOG.md) under an `## Unreleased` section if your change is user-facing

## Reporting Issues

- Use [GitHub Issues](https://github.com/moritz-grimm/steam-vault/issues) to report bugs or suggest features
- Include steps to reproduce for bug reports
- Mention your Node.js version and Windows version

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
