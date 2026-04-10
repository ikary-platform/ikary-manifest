CREATE TABLE IF NOT EXISTS log_settings (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT NOT NULL,
  workspace_id  TEXT NULL,
  cell_id       TEXT NULL,
  scope         TEXT NOT NULL CHECK (scope IN ('tenant', 'workspace', 'cell')),
  log_level     TEXT NOT NULL DEFAULT 'normal'
                  CHECK (log_level IN ('verbose', 'normal', 'production')),
  version       INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (tenant_id, workspace_id, cell_id)
);

CREATE INDEX IF NOT EXISTS idx_log_settings_tenant ON log_settings (tenant_id);
