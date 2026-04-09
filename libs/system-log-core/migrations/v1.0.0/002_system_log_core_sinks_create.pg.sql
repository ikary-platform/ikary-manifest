BEGIN;

CREATE TABLE IF NOT EXISTS log_sinks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL,
  workspace_id    UUID NULL,
  cell_id         UUID NULL,
  scope           VARCHAR(16) NOT NULL CHECK (scope IN ('tenant', 'workspace', 'cell')),
  sink_type       VARCHAR(16) NOT NULL CHECK (sink_type IN ('ui', 'persistent', 'external')),
  retention_hours INT NOT NULL,
  config          JSONB NOT NULL DEFAULT '{}',
  is_enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  version         INT NOT NULL DEFAULT 1,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_log_sinks_tenant ON log_sinks (tenant_id, is_enabled);

COMMIT;
