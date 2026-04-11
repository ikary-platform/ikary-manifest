# Manifest commands

These commands create, validate, and compile Cell manifests.

## `ikary init [project-name]`

Creates a new Cell manifest project with an interactive wizard.

```bash
ikary init my-app
```

The wizard prompts for a project description and generates:

- `manifest.json` — starter Cell manifest
- `CLAUDE.md` — AI context for Claude Code
- `.mcp.json` — MCP server configuration
- `.claude/commands/` — slash command templates

After scaffolding, the wizard prints next steps for your chosen workflow.

---

## `ikary validate <path>`

Validates a Cell manifest against the schema and runs semantic checks.

```bash
ikary validate ./manifest.json
```

On success:

<<< @/snippets/cli/validate-success.txt

On failure, each error is listed with its path and message:

<<< @/snippets/cli/validate-error.txt

Pass `--explain` to fetch fix suggestions for each error from the IKARY guidance API:

```bash
ikary validate ./manifest.json --explain
```

| Option | Description |
|--------|-------------|
| `--explain` | Fetch fix suggestions for each validation error |

---

## `ikary compile <path>`

Compiles a Cell manifest to its normalized form. The engine resolves defaults, derives computed fields, and produces the structure that runtimes consume.

```bash
ikary compile ./manifest.json
```

Write the output to a file:

```bash
ikary compile ./manifest.json -o compiled.json
```

Print to stdout:

```bash
ikary compile ./manifest.json --stdout
```

| Option | Description |
|--------|-------------|
| `-o, --output <file>` | Write compiled JSON to a file |
| `--stdout` | Print compiled JSON to stdout |

---

## `ikary preview <path>`

Compiles a manifest and opens a browser preview. Requires the local stack to be running.

```bash
ikary preview ./manifest.json
```

Start the local stack first with [`ikary local start`](/cli/local#ikary-local-start-manifest).
