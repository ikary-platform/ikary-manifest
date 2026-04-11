-- SQLite variant of 001_auth_sso_create_sso_sessions
-- NOTE: PRAGMA foreign_keys = ON must be set by the migration runner.

CREATE TABLE IF NOT EXISTS sso_sessions (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id    TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
  token_hash   TEXT NOT NULL,
  ip_address   TEXT,
  user_agent   TEXT,
  expires_at   TEXT NOT NULL,
  revoked_at   TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS sso_sessions_lookup_idx
  ON sso_sessions(tenant_id, user_id)
  WHERE revoked_at IS NULL;
