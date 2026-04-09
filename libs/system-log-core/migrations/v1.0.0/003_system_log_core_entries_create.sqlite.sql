CREATE TABLE IF NOT EXISTS platform_logs (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL,
  tenant_slug     TEXT NOT NULL,
  workspace_id    TEXT NULL,
  workspace_slug  TEXT NULL,
  cell_id         TEXT NULL,
  cell_slug       TEXT NULL,
  service         TEXT NOT NULL DEFAULT 'unknown',
  operation       TEXT NOT NULL DEFAULT 'unknown',
  level           TEXT NOT NULL CHECK (level IN ('trace', 'debug', 'info', 'warn', 'error', 'fatal')),
  message         TEXT NOT NULL,
  source          TEXT NULL,
  metadata        TEXT NULL,
  request_id      TEXT NULL,
  trace_id        TEXT NULL,
  span_id         TEXT NULL,
  correlation_id  TEXT NULL,
  actor_id        TEXT NULL,
  actor_type      TEXT NULL,
  sink_type       TEXT NOT NULL CHECK (sink_type IN ('ui', 'persistent', 'external')),
  logged_at       TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at      TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_platform_logs_tenant
  ON platform_logs (tenant_id, logged_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_logs_workspace
  ON platform_logs (tenant_id, workspace_id, logged_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_logs_cell
  ON platform_logs (tenant_id, workspace_id, cell_id, logged_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_logs_ttl
  ON platform_logs (expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_platform_logs_service
  ON platform_logs (service);

CREATE INDEX IF NOT EXISTS idx_platform_logs_operation
  ON platform_logs (operation);
