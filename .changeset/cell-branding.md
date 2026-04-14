---
'@ikary/cell-branding': minor
---

Introduces `@ikary/cell-branding`, a per-cell branding library with a NestJS
server module (Kysely repository + Postgres migration consumed by
`cell-runtime-api`), a React provider tree, React Query and localStorage data
hook factories, and an admin dialog. Default behavior preserves bare-metal
shadcn defaults; overriding the accent writes HSL triplets to `--primary`,
`--primary-foreground`, and `--ring` so Tailwind tokens follow the brand.

Also swaps hardcoded `blue-*` utility classes across `cell-primitives` (16
files) and the playground preview for shadcn `primary` / `ring` tokens so the
rendered cell runtime follows the user's accent color. Tone-variant `info`
badges keep their semantic blue.
