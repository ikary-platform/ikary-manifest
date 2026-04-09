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
