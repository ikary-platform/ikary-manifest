BEGIN;

CREATE TABLE IF NOT EXISTS platform_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL,
  tenant_slug     VARCHAR(64) NOT NULL,
  workspace_id    UUID NULL,
  workspace_slug  VARCHAR(64) NULL,
  cell_id         UUID NULL,
  cell_slug       VARCHAR(64) NULL,
  service         VARCHAR(64) NOT NULL DEFAULT 'unknown',
  operation       VARCHAR(128) NOT NULL DEFAULT 'unknown',
  level           VARCHAR(16) NOT NULL CHECK (level IN ('trace', 'debug', 'info', 'warn', 'error', 'fatal')),
  message         TEXT NOT NULL,
  source          VARCHAR(128) NULL,
  metadata        JSONB NULL,
  request_id      UUID NULL,
  trace_id        VARCHAR(64) NULL,
  span_id         VARCHAR(32) NULL,
  correlation_id  UUID NULL,
  actor_id        UUID NULL,
  actor_type      VARCHAR(32) NULL,
  sink_type       VARCHAR(16) NOT NULL CHECK (sink_type IN ('ui', 'persistent', 'external')),
  logged_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_platform_logs_tenant
  ON platform_logs (tenant_id, logged_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_logs_workspace
  ON platform_logs (tenant_id, workspace_id, logged_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_logs_cell
  ON platform_logs (tenant_id, workspace_id, cell_id, logged_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_logs_ttl
  ON platform_logs (expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_platform_logs_correlation
  ON platform_logs (correlation_id) WHERE correlation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_platform_logs_trace
  ON platform_logs (trace_id) WHERE trace_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_platform_logs_service
  ON platform_logs (service);

CREATE INDEX IF NOT EXISTS idx_platform_logs_operation
  ON platform_logs (operation);

COMMIT;
