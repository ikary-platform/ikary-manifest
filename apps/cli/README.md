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
ikary local db status          # Show applied and pending migrations per package
ikary local db reset --yes     # Clear migration tracking (dev only)
```

Requires Docker Desktop or Podman.

#### Extending the migration package list

The `ikary local db migrate | status | reset` commands discover `@ikary/*`
migrations by iterating a built-in default list. Downstream projects can add
their own packages two ways — both additive, and both safe to use together:

- Repeatable `--package <name>` flag:

  ```bash
  ikary local db migrate --package @acme/enterprise-worker
  ```

- `ikary.config.json` in the project root:

  ```json
  {
    "migrate": {
      "packages": ["@acme/enterprise-worker", "@acme/billing-worker"]
    }
  }
  ```

Packages not installed in the active project are silently skipped, so the same
command works across a repo that installs a full set or just a subset.

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
