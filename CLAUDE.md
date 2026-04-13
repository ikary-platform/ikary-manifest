### Documentation writing

When writing, editing, or reviewing any documentation — including .md files,
JSDoc comments, component contracts, READMEs, and changelogs — read
.claude/doc-voice.md fully before writing a single word.

### Zod contracts rule

Every type that crosses a system boundary (config, external input, API contract,
service interface) MUST be defined as a `z.ZodSchema` first, with the TypeScript
type derived via `z.infer<typeof schema>`. Raw `interface` or `type` declarations
are only acceptable for purely structural/generic helpers with no runtime
validation need.

```ts
// Correct
export const listOptionsSchema = z.object({ page: z.number().default(1) });
export type ListOptions = z.infer<typeof listOptionsSchema>;

// Wrong — loses runtime validation
export interface ListOptions { page: number; }
```

### Library rules

Every `libs/*` Node.js / TypeScript package MUST comply with:

- `libs/LIBRARY_STYLE_RULES.md` — naming, `microPackageKind`, folder layout, Zod, Kysely
- `libs/LIBRARY_TEMPLATE.md` — folder blueprint, export conventions, README template

Key rules at a glance:

- Declare `"microPackageKind"` in `package.json`
- Use `src/shared/` (not `src/contracts/`) for browser-safe Zod schemas and types
- Use `src/server/` for Node/NestJS runtime code in mixed packages
- All runtime DB access must use `@ikary/system-db-core` (Kysely repositories)
- No inline SQL strings outside migrations and approved repository `sql\`\`` edge cases

### Naming conventions

Libs MUST be prefixed `system-*` (wraps a 3rd-party tool, reusable outside the
Cell domain) or `cell-*` (Cell manifest domain). No exceptions.

- `cell-*` — depends on `@ikary/cell-contract` or models the Cell domain
  (contract, engine, renderer, primitives, runtime).
- `system-*` — wraps a 3rd-party tool with no Cell-specific knowledge
  (Postgres via Kysely, react-intl, JWT, Pino, NestJS).

Apps use descriptive names; the `cell-*` prefix is only applied when the app
is Cell-specific.

Repo-orchestration scripts live in root `/scripts/`, never in `libs/scripts/`.

Every publishable package shares one version enforced by Changesets `fixed`
config in `.changeset/config.json`. Release everything or nothing. When
adding a new `apps/*` or `libs/*` package, add its `@ikary/*` name to the
`fixed` array at the same time.

See `apps/docs/guide/repository-conventions.md` for the full rule and
concrete examples.
