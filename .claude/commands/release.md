# Analyze the project and generate a tailored release checklist for this release

## Analysis (run silently, only show results)

- Read `CHANGELOG.md` => collect all entries under `## [Unreleased]`
- Read current version from `package.json`
- Check if the following files exist: `package-lock.json`

## Output

Show me first:

- Current version
- Recommended new version (Patch / Minor / Major) + short reasoning based on the Unreleased entries

Then generate the following checklist:

---

## Release vX.Y.Z - Checklist

### Preparation

- [ ] Current branch is `dev`
- [ ] All changes committed and pushed to `dev`

### Version bump (on `dev`)

- [ ] `CHANGELOG.md` - rename `## [Unreleased]` to `## [x.y.z] - YYYY-MM-DD` (today's date, ISO format)
- [ ] `CHANGELOG.md` - add a new empty `## [Unreleased]` section at the top
- [ ] `package.json` - set `version` to `x.y.z`
- [ ] `package-lock.json` - set `version` to `x.y.z`
- [ ] Commit: `chore(release): vx.y.z`
- [ ] `git push origin dev`

### Merge

- [ ] Merge `dev` → `main` (merge commit - `chore: dev => main for vx.y.z`)
- [ ] `git push origin main`

### Tag & Release (on `main`)

- [ ] `git checkout main && git pull`
- [ ] Create tag: `git tag vx.y.z`
- [ ] `git push --tags`
- [ ] Create GitHub Release

### Merge Main back into Dev

- [ ] Merge the current main branch back into dev (Commit: `chore: sync dev with main after vx.y.z`)

---

When I'm done and type "check", verify the following against the actual files:
current branch, version in `package.json` and `package-lock.json`, latest commit message, whether the tag exists.
