CREATE TABLE IF NOT EXISTS log_sinks (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL,
  workspace_id    TEXT NULL,
  cell_id         TEXT NULL,
  scope           TEXT NOT NULL CHECK (scope IN ('tenant', 'workspace', 'cell')),
  sink_type       TEXT NOT NULL CHECK (sink_type IN ('ui', 'persistent', 'external')),
  retention_hours INTEGER NOT NULL,
  config          TEXT NOT NULL DEFAULT '{}',
  is_enabled      INTEGER NOT NULL DEFAULT 1,
  version         INTEGER NOT NULL DEFAULT 1,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_log_sinks_tenant ON log_sinks (tenant_id, is_enabled);
