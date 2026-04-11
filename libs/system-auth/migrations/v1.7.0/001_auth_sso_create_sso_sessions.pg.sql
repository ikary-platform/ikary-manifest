CREATE TABLE sso_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  token_hash   TEXT NOT NULL,
  ip_address   INET,
  user_agent   TEXT,
  expires_at   TIMESTAMPTZ NOT NULL,
  revoked_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX sso_sessions_lookup_idx
  ON sso_sessions(tenant_id, user_id)
  WHERE revoked_at IS NULL;
