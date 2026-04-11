-- SQLite variant of 003_auth_membership_create_memberships
-- NOTE: PRAGMA foreign_keys = ON must be set by the migration runner.

CREATE TABLE IF NOT EXISTS workspace_members (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
  role_code TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS workspace_members_workspace_user_active_idx
  ON workspace_members (workspace_id, user_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS workspace_members_user_idx
  ON workspace_members (user_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS workspace_members_workspace_idx
  ON workspace_members (workspace_id)
  WHERE deleted_at IS NULL;
