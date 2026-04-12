# @ikary/cli

CLI for generating, validating, compiling, and previewing IKARY Cell manifests.

## Install

```bash
npx @ikary/ikary init
```

Or install globally:

```bash
npm install -g @ikary/cli
ikary --help
```

## Commands

### Manifest

```bash
ikary init [project-name]      # Create a new Cell manifest project
ikary validate <path>          # Validate a manifest (--explain for fix suggestions)
ikary compile <path>           # Compile a manifest to normalized JSON
ikary preview <path>           # Preview a manifest in the browser
```

### Local development stack

```bash
ikary local start <manifest>   # Start preview server + data API + MCP server
ikary local stop               # Stop the stack
ikary local status             # Show container status
ikary local logs [service]     # Stream logs (-f to follow)
ikary local reset-data         # Clear the local PostgreSQL volume
ikary local db migrate         # Run pending database migrations
```

Requires Docker Desktop or Podman.

### Custom primitives

```bash
ikary primitive add <name>     # Scaffold a new primitive (6 files + config)
ikary primitive validate       # Validate ikary-primitives.yaml
ikary primitive list           # List all primitives (--json for machine output)
ikary primitive studio         # Open the Primitive Studio in the browser
```

### Claude Code integration

```bash
ikary setup ai                 # Write CLAUDE.md, .mcp.json, and slash commands
ikary setup ai --local         # Point MCP config at the local stack
ikary setup ai --force         # Overwrite existing files
```

## Documentation

Full documentation: [documentation.ikary.co](https://documentation.ikary.co)

## License

MIT
