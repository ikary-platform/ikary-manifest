# CLI Reference

The IKARY CLI manages every aspect of working with Cell manifests: scaffolding, validation, compilation, the local development stack, custom UI primitives, and AI assistant integrations.

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

You can also use the `@ikary/ikary` wrapper, which forwards to `@ikary/cli`:

```bash
npx @ikary/ikary init
```

## Command groups

| Group | Commands | Purpose |
|-------|----------|---------|
| [Manifest](/cli/manifest) | `init`, `validate`, `compile`, `preview` | Create and validate Cell manifests |
| [Local stack](/cli/local) | `local start/stop/status/logs/reset-data/db` | Run the full development stack locally |
| [Primitives](/cli/primitives) | `primitive add/validate/list/studio` | Scaffold and preview custom UI components |
| [Setup](/cli/setup) | `setup ai` | Configure Claude Code integration |

## Global flags

| Flag | Description |
|------|-------------|
| `--offline` | Skip API calls and use local validation only |
| `--version` | Print the installed version |

## Requirements

- Node.js 20 or later
- Docker Desktop or Podman for `ikary local` commands
