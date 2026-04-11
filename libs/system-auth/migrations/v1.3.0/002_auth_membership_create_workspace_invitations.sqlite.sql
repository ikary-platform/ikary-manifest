-- SQLite variant of 002_auth_membership_create_workspace_invitations
-- NOTE: PRAGMA foreign_keys = ON must be set by the migration runner.

CREATE TABLE IF NOT EXISTS workspace_invitations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  invitee_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  invitee_tenant_member_id TEXT REFERENCES tenant_members(id) ON DELETE SET NULL,
  invited_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  workspace_member_id TEXT REFERENCES workspace_members(id) ON DELETE CASCADE,
  invited_role TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'revoked')),
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS workspace_invitations_pending_email_idx
  ON workspace_invitations (workspace_id, LOWER(invitee_email))
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS workspace_invitations_token_hash_idx
  ON workspace_invitations (token_hash)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS workspace_invitations_workspace_idx
  ON workspace_invitations (workspace_id, status);
