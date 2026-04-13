---
"@ikary/cli": minor
"@ikary/ikary": minor
---

Adopt repository-wide naming convention (`cell-*` for Cell-domain libs,
`system-*` for 3rd-party-wrapping infrastructure) and synchronize versions
across all workspace packages.

The `fixed` Changesets config ensures every package in apps/ and libs/
releases at the same version going forward. Release everything or nothing.

Renamed libs: `contract` -> `cell-contract`, `engine` -> `cell-engine`,
`loader` -> `cell-loader`, `renderer` -> `cell-renderer`, `presentation`
-> `cell-presentation`, `data` -> `cell-data`, `primitives` ->
`cell-primitives`, `primitive-contract` -> `cell-primitive-contract`,
`primitive-studio` -> `cell-primitive-studio`, `cell-migration-core`
-> `system-migration-core`.

Renamed apps: `preview-server` -> `cell-preview-server`, `playground-app`
-> `cell-playground`. Old `cell-playground` temporarily renamed to
`cell-playground-legacy` pending deletion once the public
`cell-playground` reaches feature parity.

Relocated `libs/scripts/generate-json-schema.ts` to root `scripts/`.
