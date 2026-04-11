# Setup commands

## `ikary setup ai`

Configures Claude Code for the current project. Writes an MCP server configuration, a context file for the AI, and a set of slash command templates.

```bash
ikary setup ai
```

By default it points to the public IKARY MCP server at `https://public.ikary.co/mcp`. Pass `--local` to use your running local stack instead:

```bash
ikary setup ai --local
```

Use `--local` after starting the local stack with `ikary local start`. The local MCP server has access to your project's custom primitives and live data, which the public server does not.

Pass `--force` to overwrite files that already exist:

```bash
ikary setup ai --force
```

### Files written

| File | Purpose |
|------|---------|
| `CLAUDE.md` | AI context: manifest format, validation rules, MCP tools reference, primitives workflow |
| `.mcp.json` | MCP server URL for Claude Code |
| `.claude/settings.json` | Allowed CLI commands for Claude Code |
| `.claude/commands/ikary-add-entity.md` | `/ikary-add-entity` — scaffold a new entity in the manifest |
| `.claude/commands/ikary-validate.md` | `/ikary-validate` — validate the manifest and explain errors |
| `.claude/commands/ikary-bootstrap.md` | `/ikary-bootstrap` — build manifest step by step |
| `.claude/commands/ikary-browse-primitives.md` | `/ikary-browse-primitives` — list primitives and show contracts |
| `.claude/commands/ikary-create-primitive.md` | `/ikary-create-primitive` — scaffold and implement a custom primitive |
| `.claude/commands/ikary-update-primitive.md` | `/ikary-update-primitive` — update or version an existing primitive |

### Options

| Option | Description |
|--------|-------------|
| `--local` | Point `.mcp.json` at `http://localhost:4502/mcp` |
| `--force` | Overwrite existing files |
