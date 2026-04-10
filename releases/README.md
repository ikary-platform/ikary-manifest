# Release Notes

One file per `@ikary/cli` release. Files are created automatically by the release workflow after each publish and can be edited by hand afterward.

## File naming

`vMAJOR.MINOR.PATCH.md` — e.g. `v0.1.2.md`

## File format

```markdown
---
version: 0.1.2
date: 2026-04-10
---

# v0.1.2

One-line summary of this release.

## Added

- Description of new feature.

## Changed

- Description of behavioral change.

## Fixed

- Description of bug fix.

## Removed

- Description of removed feature or flag.
```

Omit sections that have no entries. Use past tense. One sentence per entry. No adjectives.

## Editing auto-generated notes

The workflow writes the raw changeset descriptions into the file. If those descriptions are too terse, edit the file directly on main after the release. The GitHub Release is created from the CHANGELOG at publish time and will not update automatically — edit it separately on the GitHub Releases page if needed.
