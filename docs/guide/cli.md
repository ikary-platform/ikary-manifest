# CLI

The IKARY CLI scaffolds, validates, compiles, and previews Cell manifests. It manages the local development stack, custom UI primitives, and Claude Code integrations.

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

## Quick start

```bash
# 1. Create a new project
ikary init my-app
cd my-app

# 2. Start the local stack (requires Docker)
ikary local start manifest.json

# 3. Open the preview
open http://localhost:3000
```

The local stack hot-reloads when you edit `manifest.json`. Stop it with `ikary local stop`.

---

## Manifest commands

### `ikary init [project-name]`

Creates a new Cell manifest project with an interactive wizard.

```bash
ikary init my-app
```

The wizard prompts for a project description and generates:

- `manifest.json` with a starter Cell manifest
- `CLAUDE.md` with AI context for Claude Code
- `.mcp.json` pointing to the IKARY MCP server
- `.claude/commands/` with slash command templates for your AI assistant

### `ikary validate <path>`

Validates a Cell manifest against the schema and runs semantic checks.

```bash
ikary validate ./manifest.json
```

On success:

<<< @/snippets/cli/validate-success.txt

On failure:

<<< @/snippets/cli/validate-error.txt

Pass `--explain` to get fix suggestions for each error:

```bash
ikary validate ./manifest.json --explain
```

| Option | Description |
|--------|-------------|
| `--explain` | Fetch fix suggestions for each validation error |

### `ikary compile <path>`

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

### `ikary preview <path>`

Compiles a manifest and opens a browser preview. Requires the local stack to be running (`ikary local start`).

```bash
ikary preview ./manifest.json
```

For a quick preview without Docker, use the `--playground` flag. It compiles the manifest and opens the hosted IKARY Playground.

---

## Local development stack

`ikary local` manages a Docker Compose stack that runs three services together: the preview server, the data API, and the MCP server.

**Requires:** Docker Desktop or Podman, and the `ikary-manifest` repository checked out locally.

### `ikary local start <manifest>`

Starts the full local stack for a manifest file.

```bash
ikary local start ./manifest.json
```

Example output:

```
Starting IKARY local stack

Pre-flight checks:

  ✓ Manifest          ./manifest.json
  ✓ Container runtime docker running
  ✓ docker-compose.yml found
  ✓ Port Preview   (3000)   free
  ✓ Port Data API  (4000)   free
  ✓ Port MCP Server(3100)   free

✔ All services healthy

Services:

  Preview     http://localhost:3000
  Data API    http://localhost:4000
  MCP Server  http://localhost:3100/mcp
```

The preview hot-reloads when `manifest.json` changes.

### `ikary local stop`

Stops all running stack containers.

```bash
ikary local stop
```

### `ikary local status`

Shows the current status of each container in the stack.

```bash
ikary local status
```

### `ikary local logs [service]`

Streams logs from the stack. Pass a service name to filter.

```bash
ikary local logs          # all services
ikary local logs preview  # preview server only
ikary local logs api      # data API only
```

| Option | Description |
|--------|-------------|
| `-f, --follow` | Follow log output (default: true) |

### `ikary local reset-data`

Deletes the local SQLite data volume. Stops the stack first if it is running.

```bash
ikary local reset-data
```

Use this to clear all seed data and start fresh.

### `ikary local db`

Database migration commands for the local stack.

```bash
ikary local db migrate    # run pending migrations
ikary local db status     # show migration status
ikary local db reset      # clear migration tracking
```

| Subcommand | Description |
|-----------|-------------|
| `migrate` | Run pending migrations |
| `status` | Show which migrations have run |
| `reset` | Clear migration tracking (does not drop tables) |

---

## Custom primitives

`ikary primitive` manages custom UI components that extend the built-in primitive set. See the [Custom Primitives guide](/guide/primitives) for the full workflow.

### `ikary primitive add <name>`

Scaffolds a new custom primitive in the current project.

```bash
ikary primitive add my-widget
```

The command prompts for a display label, description, and category, then generates six files:

```
Add primitive

  ✔ Created my-widget primitive

  primitives/my-widget/MyWidget.tsx                React component
  primitives/my-widget/MyWidgetPresentationSchema.ts   Zod props schema
  primitives/my-widget/my-widget.contract.yaml     Human-readable contract
  primitives/my-widget/MyWidget.resolver.ts        Props resolver
  primitives/my-widget/MyWidget.register.ts        Registration
  primitives/my-widget/MyWidget.example.ts         Example scenarios
  ikary-primitives.yaml                            Updated
```

| Option | Description |
|--------|-------------|
| `--label <label>` | Display label (skips prompt) |
| `--description <desc>` | Short description (skips prompt) |
| `--category <cat>` | Category: data, form, layout, feedback, navigation, custom |

### `ikary primitive validate`

Validates all entries in `ikary-primitives.yaml`. Checks that contract files parse correctly and that referenced source files exist.

```bash
ikary primitive validate
```

### `ikary primitive list`

Lists all registered primitives, both core and custom.

```bash
ikary primitive list
ikary primitive list --json   # machine-readable output
```

### `ikary primitive studio`

Opens the Primitive Studio in the browser. Requires the local stack to be running.

```bash
ikary primitive studio
```

The Studio opens at `http://localhost:3000/__primitive-studio`. It shows all custom primitives with a live props editor and component preview.

---

## Claude Code integration

### `ikary setup ai`

Configures Claude Code for the current project. Writes an MCP configuration and a set of slash command templates.

```bash
ikary setup ai
```

By default it points to the public IKARY MCP server. Pass `--local` to use the local stack instead:

```bash
ikary setup ai --local
```

Use `--local` after running `ikary local start` so Claude Code can read your project's custom primitives and validate against your local data.

Use `--force` to overwrite existing files:

```bash
ikary setup ai --force
```

Files written:

| File | Purpose |
|------|---------|
| `CLAUDE.md` | AI context: manifest format, rules, MCP tools reference |
| `.mcp.json` | MCP server URL for Claude Code |
| `.claude/settings.json` | Allowed CLI commands |
| `.claude/commands/add-entity.md` | `/add-entity` slash command |
| `.claude/commands/validate.md` | `/validate` slash command |
| `.claude/commands/recommend.md` | `/recommend` slash command |
| `.claude/commands/browse-primitives.md` | `/browse-primitives` slash command |
| `.claude/commands/create-primitive.md` | `/create-primitive` slash command |
| `.claude/commands/update-primitive.md` | `/update-primitive` slash command |

| Option | Description |
|--------|-------------|
| `--local` | Point MCP config at `http://localhost:3100/mcp` |
| `--force` | Overwrite existing files |

---

## Global flags

| Flag | Description |
|------|-------------|
| `--offline` | Skip API calls and use local validation only |

---

## Requirements

- Node.js 20 or later
- Docker Desktop (or Podman) for `ikary local` commands
