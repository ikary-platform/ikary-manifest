BEGIN;

CREATE TABLE IF NOT EXISTS log_settings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL,
  workspace_id  UUID NULL,
  cell_id       UUID NULL,
  scope         VARCHAR(16) NOT NULL CHECK (scope IN ('tenant', 'workspace', 'cell')),
  log_level     VARCHAR(16) NOT NULL DEFAULT 'normal'
                  CHECK (log_level IN ('verbose', 'normal', 'production')),
  version       INT NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id, cell_id)
);

CREATE INDEX IF NOT EXISTS idx_log_settings_tenant ON log_settings (tenant_id);

COMMIT;
