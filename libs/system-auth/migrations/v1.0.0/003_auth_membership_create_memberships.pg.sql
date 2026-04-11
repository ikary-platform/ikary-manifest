BEGIN;

CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
  role_code VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
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

COMMIT;
