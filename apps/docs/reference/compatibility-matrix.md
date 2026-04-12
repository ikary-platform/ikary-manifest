---
outline: deep
---

# Compatibility Matrix

This matrix summarizes current toolchain and runtime compatibility.

## Toolchain

| Requirement | Supported | Notes |
|---|---|---|
| Node.js | `>= 20` | Required by repo and CLI packages |
| pnpm | `9.x` | Workspace package manager |
| npm | `>= 10` | Needed for `npx` install flow |

## Local runtime dependencies

| Requirement | Supported | Notes |
|---|---|---|
| Docker Desktop | yes | Recommended for local stack commands |
| Podman | yes | Supported alternative runtime |
| PostgreSQL | bundled in local stack | Default local stack dependency |

## Operating systems

| OS | Status | Notes |
|---|---|---|
| macOS | supported | Main local development path |
| Linux | supported | Main local development path |
| Windows | supported | Use PowerShell or WSL for shell commands |

## Browser and MCP clients

| Target | Status | Notes |
|---|---|---|
| Browser preview (`localhost:4500`) | supported | Generated preview and local stack UI |
| Claude Code | supported | Use `ikary setup ai` |
| Claude Desktop | supported | Configure MCP URL manually |
| Cursor | supported | Configure MCP URL manually |

## Network endpoints

| Endpoint | Purpose |
|---|---|
| `https://documentation.ikary.co` | Documentation site |
| `https://public.ikary.co/api/*` | Contract Intelligence REST API |
| `https://public.ikary.co/mcp` | Public MCP endpoint |

## Notes

Check release notes before upgrades when your workflow depends on beta capabilities.
