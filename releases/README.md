# Release Notes

One file per `@ikary/cli` release, named `vMAJOR.MINOR.PATCH.md`.

Files are generated automatically by `release.yml` using Claude (`claude-opus-4-6`) after each publish. The model receives the raw changeset entries for every published package and writes human-readable notes grouped by component. Edit the file on main if the output needs adjustment — the GitHub Release is not updated automatically.

## File format

```markdown
# vX.Y.Z

[2-3 sentence summary of what this release brings.]

## CLI

[User-facing changes to the ikary CLI.]

## @ikary/some-package

[Changes for that package — omitted if there are no user-facing changes.]
```

## Sections

| Section heading | Covers |
|---|---|
| `CLI` | `@ikary/cli` |
| Full package name | Any other published package with user-facing changes |

Dependency-only bumps are omitted. `@ikary/ikary` (the thin npx wrapper) is always omitted — it mirrors the CLI version.

## Editing after generation

Edit `releases/vX.Y.Z.md` directly on main. Then update the matching GitHub Release body manually on the GitHub Releases page if needed.
