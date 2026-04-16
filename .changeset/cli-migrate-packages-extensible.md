---
'@ikary/cli': minor
---

Make `ikary local db migrate | status | reset` extensible without a PR to
`ikary-manifest`. Downstream projects (e.g. `ikary-worker` or a private
`ikary-enterprise-worker`) can now contribute their own `@ikary/*` migration
packages through either:

- a repeatable `--package <name>` CLI flag, or
- an `ikary.config.json` file in the project root with `migrate.packages`.

Both extension points are additive — the built-in `DEFAULT_MIGRATION_PACKAGES`
set is always included, and the effective list is deduplicated while preserving
first-occurrence order so migration dependencies stay correct. Packages not
installed in the active project are silently skipped, keeping the command safe
to run from any repo that installs a subset of the defaults.
