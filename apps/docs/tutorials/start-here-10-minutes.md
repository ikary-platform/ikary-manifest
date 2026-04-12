# Start Here In 10 Minutes

This tutorial takes you from zero to a running IKARY app.

## What you will build

You will scaffold a project, validate the manifest, and open a live preview.

## Prerequisites

- Node.js 20 or later
- npm 10 or later
- Docker Desktop or Podman for the local stack

## 1. Scaffold a project

```bash
npx @ikary/ikary init my-app
cd my-app
```

Expected result:

- `manifest.json` is created
- `CLAUDE.md` and `.mcp.json` are created
- CLI prints the next commands

## 2. Validate the manifest

```bash
ikary validate manifest.json
```

Expected result:

- CLI prints `Manifest is valid`
- Entity, page, and role counts are shown

## 3. Start the local stack

```bash
ikary local start manifest.json
```

Expected result:

- Services become healthy
- Preview URL: `http://localhost:4500`
- Data API URL: `http://localhost:4501`
- MCP URL: `http://localhost:4502/mcp`

Open `http://localhost:4500` in your browser.

## 4. Make one visible change

Edit `manifest.json` and change `metadata.name`.

```json
{
  "metadata": {
    "name": "My Updated App"
  }
}
```

Expected result:

- Preview updates after save
- New app name is visible in the UI

## 5. Optional: set up AI commands

```bash
ikary setup ai --local
```

This points Claude Code at your local MCP server.

## Next steps

- [Build a mini CRM](/tutorials/mini-crm)
- [Troubleshoot local setup](/how-to/troubleshoot-local-stack)
- [CLI reference](/cli/)
