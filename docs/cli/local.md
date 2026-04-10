# Local development stack

`ikary local` manages a Docker Compose stack that runs three services together: the preview server, the data API, and the MCP server.

## Port reference

| Port | Service | URL |
|------|---------|-----|
| 4500 | Preview Server | http://localhost:4500 |
| 4501 | Data API | http://localhost:4501 |
| 4502 | MCP Server | http://localhost:4502/mcp |

**Requires:** Docker Desktop or Podman.

## `ikary local start <manifest>`

Starts the full local stack for a manifest file. Pulls the latest images, runs pre-flight checks, then starts all containers.

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
  ✓ Port Preview   (4500)   free
  ✓ Port Data API  (4501)   free
  ✓ Port MCP Server(4502)   free

✔ All services healthy

Services:

  Preview     http://localhost:4500
  Data API    http://localhost:4501
  MCP Server  http://localhost:4502/mcp
```

The preview server hot-reloads when `manifest.json` changes. Entity records persist in a local SQLite database between restarts.

---

## `ikary local stop`

Stops all running stack containers.

```bash
ikary local stop
```

---

## `ikary local status`

Shows the current status and health of each container.

```bash
ikary local status
```

---

## `ikary local logs [service]`

Streams logs from the stack. Pass a service name to filter output.

```bash
ikary local logs          # all services
ikary local logs preview  # preview server only
ikary local logs api      # data API only
ikary local logs mcp      # MCP server only
```

| Option | Description |
|--------|-------------|
| `-f, --follow` | Follow log output (default: true) |

---

## `ikary local reset-data`

Deletes the local SQLite data volume. Stops the stack first if it is running.

```bash
ikary local reset-data
```

Use this to clear all seed data and return to an empty database.

---

## `ikary local db`

Database migration commands. Useful after pulling a new version of the runtime that includes schema changes.

```bash
ikary local db migrate        # run pending migrations
ikary local db status         # show which migrations have run
ikary local db reset --yes    # clear migration tracking (--yes required)
```

| Subcommand | Description |
|-----------|-------------|
| `migrate` | Run all pending migrations against the local database |
| `status` | Print the migration history and any pending migrations |
| `reset` | Clear the migration tracking table (does not drop data tables); requires `--yes` |

| Option (migrate) | Description |
|-----------------|-------------|
| `--database-url <url>` | Target a specific database instead of the local volume |
| `--dry-run` | Print migrations that would run without executing them |
| `--force` | Run migrations even if the database reports them as applied |

| Option (reset) | Description |
|----------------|-------------|
| `--yes` | Required. Confirms the reset without an interactive prompt |
