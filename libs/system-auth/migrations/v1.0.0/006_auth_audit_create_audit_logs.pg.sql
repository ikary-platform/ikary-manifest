BEGIN;

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(160) NOT NULL,
  resource_type VARCHAR(120) NOT NULL,
  resource_id UUID,
  http_method VARCHAR(10),
  request_path TEXT,
  ip_address INET,
  user_agent TEXT,
  request_id UUID,
  status_code INT,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_logs_org_created_idx
  ON audit_logs (workspace_id, created_at DESC);

CREATE INDEX IF NOT EXISTS audit_logs_actor_idx
  ON audit_logs (actor_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS audit_logs_resource_idx
  ON audit_logs (workspace_id, resource_type, resource_id);

COMMIT;
