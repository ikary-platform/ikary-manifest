# Getting Started

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

The preview server hot-reloads when you edit `manifest.json`. The data API runs at `http://localhost:4000`. Stop everything with `ikary local stop`.

## Validate your manifest

```bash
ikary validate manifest.json
```

<<< @/snippets/cli/validate-success.txt

Pass `--explain` to get fix suggestions when errors are found:

```bash
ikary validate manifest.json --explain
```

## Set up Claude Code

Run this once in your project directory to write the MCP config and slash command templates:

```bash
ikary setup ai
```

Then open Claude Code and use `/ikary-add-entity`, `/ikary-validate`, `/ikary-bootstrap`, or `/ikary-create-primitive` to build with AI assistance.

## Next steps

- [CLI Reference](/cli/) — full reference for all commands and options
- [Manifest Format](/guide/manifest-format) — entity, page, and navigation schema
- [Custom Primitives](/guide/primitives) — building custom UI components
