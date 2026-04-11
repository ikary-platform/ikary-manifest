-- SQLite variant of 002_auth_workspace_add_governance_columns
-- NOTE: PRAGMA foreign_keys = ON must be set by the migration runner.

ALTER TABLE workspaces ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE workspaces ADD COLUMN created_by TEXT;
ALTER TABLE workspaces ADD COLUMN updated_by TEXT;
ALTER TABLE workspaces ADD COLUMN deleted_by TEXT;

UPDATE workspaces
SET created_by = COALESCE(created_by, created_by_user_id),
    updated_by = COALESCE(updated_by, created_by_user_id)
WHERE created_by IS NULL OR updated_by IS NULL;
