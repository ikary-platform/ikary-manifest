---
status: accepted
date: 2026-04-10
---

# 002 - Release Pipeline

## Context

The project uses [Changesets](https://github.com/changesets/action) for versioning and npm publishing. Before this decision, contributors had to remember to run `pnpm changeset` before opening a PR. Nothing enforced it. As a result, multiple features merged to main without changeset files, blocking the next publish.

Three additional gaps existed: no GitHub Release was created on publish, no permanent branch was tagged per version, and no human-readable release notes existed outside of per-package `CHANGELOG.md` files generated with commit hashes.

## Decision

We adopt a label-driven release pipeline built on three GitHub Actions workflows.

### Label reference

| Label on PR | Bump type | Changeset |
|---|---|---|
| `release` | patch | auto-created after merge |
| `release:minor` | minor | auto-created after merge |
| `release:major` | major | auto-created after merge |
| `no-changeset` | none | skipped intentionally |
| *(none)* | varies | must be included in the PR |

PRs that touch only docs, CI config, or other non-shipping files should use `no-changeset`.

### Workflow files

| File | Trigger | Responsibility |
|---|---|---|
| `.github/workflows/changeset-check.yml` | PR opened / updated | Fails if no changeset file is present. Skips if `release*` or `no-changeset` label is set. |
| `.github/workflows/auto-changeset.yml` | PR with `release*` label merged | Creates `.changeset/pr-{number}.md` and pushes it to main. |
| `.github/workflows/release.yml` | Push to main | Detects changeset files, creates the Version Packages PR, and on that PR's merge: publishes to npm, creates a GitHub Release, commits `releases/vX.Y.Z.md` to main, and creates a `release/vX.Y.Z` branch. |

### Version bump type mapping

`release` and `release:patch` both produce a patch bump. Use `release:minor` for new features and `release:major` for breaking changes.

The generated changeset targets `@ikary/cli`. Because `@ikary/cli` and `@ikary/ikary` are declared as [linked packages](https://github.com/changesets/changesets/blob/main/docs/linked-packages.md) in `.changeset/config.json`, both always publish at the same version.

### Release notes

After each publish, `release.yml` extracts the CLI's CHANGELOG section for the new version and commits `releases/vX.Y.Z.md` to main. The file is editable by hand after the fact — the GitHub Release is not updated automatically, so edit it separately on the GitHub Releases page if needed.

The `releases/` folder contains one file per CLI release. The format is documented in `releases/README.md`. Use past tense, group by Added / Changed / Fixed / Removed, one sentence per entry.

### Docs version badge

`docs/.vitepress/config.mts` reads the CLI version from `apps/cli/package.json` at build time and injects it into the navbar as a link to the npm page. The badge updates automatically when the Version Packages PR merges and triggers `docs.yml`.

### Architecture diagram

See `decisions/diagrams/ikary-release-workflow.svg`.

## Required manual step

After merging this decision, go to **GitHub → Settings → Branches → Branch protection rules → main** and add `Changeset check` as a required status check. This is the enforcement gate that blocks PRs without a changeset file or bypass label.

## Consequences

- Contributors no longer need to remember `pnpm changeset` for labeled PRs.
- Every merged PR has a clear release intent signal visible in GitHub.
- The `changeset-check` workflow blocks merges silently if the required status check is not configured. Configure it.
- Auto-generated changeset descriptions use the PR title. Keep PR titles descriptive.
- If two labeled PRs merge within seconds of each other, the `git pull --rebase` in `auto-changeset.yml` handles the conflict. A rare hard failure here requires a manual `pnpm changeset` run.
- Auto-generated release notes in `releases/` use the raw changeset descriptions. Quality depends on how descriptive those descriptions are. Edit the file on main after release if needed.
