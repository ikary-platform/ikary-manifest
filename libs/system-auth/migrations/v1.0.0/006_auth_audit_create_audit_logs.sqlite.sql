-- SQLite variant of 006_auth_audit_create_audit_logs
-- NOTE: PRAGMA foreign_keys = ON must be set by the migration runner.

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  actor_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  http_method TEXT,
  request_path TEXT,
  ip_address TEXT,
  user_agent TEXT,
  request_id TEXT,
  status_code INTEGER,
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS audit_logs_org_created_idx
  ON audit_logs (workspace_id, created_at DESC);

CREATE INDEX IF NOT EXISTS audit_logs_actor_idx
  ON audit_logs (actor_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS audit_logs_resource_idx
  ON audit_logs (workspace_id, resource_type, resource_id);
