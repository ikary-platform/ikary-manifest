# CLI

The IKARY CLI scaffolds, validates, compiles, and previews Cell manifests from the terminal.

## Install

Run commands directly with `npx`:

```bash
npx @ikary/cli init
```

Or install globally:

```bash
npm install -g @ikary/cli
ikary --help
```

You can also use the `@ikary/ikary` wrapper package, which forwards to `@ikary/cli`:

```bash
npx @ikary/ikary init
```

## Commands

### `ikary init`

Scaffolds a new Cell manifest project with an interactive wizard.

```bash
ikary init my-app
```

The wizard prompts for a project description and preferred AI tool. It generates:

- `manifest.json` with a starter Cell manifest
- `CLAUDE.md` with AI context for Claude Code
- `.claude/commands/` with slash command templates
- `.ikary/` directory for project configuration

After scaffolding, the wizard prints next steps specific to your chosen workflow.

### `ikary validate`

Validates a Cell manifest JSON file against the schema and runs semantic checks.

```bash
ikary validate ./manifest.json
```

On success, it prints entity, page, and role counts. On failure, it lists each error with its path and message.

```bash
# Example output on failure
✖ 2 validation errors

  spec.entities[0].fields[1].type
  Invalid field type "number". Expected string | boolean | date | ...

  spec.pages[0].entity
  Entity "unknown_entity" is not defined in spec.entities
```

### `ikary compile`

Compiles a Cell manifest to its normalized form. The engine resolves defaults, derives computed fields, and produces the structure that runtimes consume.

```bash
ikary compile ./manifest.json
```

Write the output to a file:

```bash
ikary compile ./manifest.json -o compiled.json
```

Print to stdout instead:

```bash
ikary compile ./manifest.json --stdout
```

| Option | Description |
|--------|-------------|
| `-o, --output <file>` | Write compiled JSON to a file |
| `--stdout` | Print compiled JSON to stdout |

### `ikary preview`

Compiles a manifest and shows instructions for previewing it in the IKARY Playground.

```bash
ikary preview ./manifest.json
```

The command validates and compiles the manifest first. If compilation succeeds, it prints a link to the live [IKARY Playground](https://ikary-platform.github.io/ikary-manifest/playground/api-runtime) where you can paste the compiled output.

A local preview server is planned for a future release.

## Version

Check the installed version:

```bash
ikary --version
```

## Requirements

- Node.js 20 or later
