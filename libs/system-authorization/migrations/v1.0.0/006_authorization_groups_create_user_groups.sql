BEGIN;

CREATE TABLE IF NOT EXISTS user_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_groups_workspace_group_fk
    FOREIGN KEY (workspace_id, group_id) REFERENCES groups(workspace_id, id) ON DELETE CASCADE,
  CONSTRAINT user_groups_unique UNIQUE (workspace_id, user_id, group_id)
);

CREATE INDEX IF NOT EXISTS user_groups_workspace_user_idx
  ON user_groups (workspace_id, user_id);

CREATE INDEX IF NOT EXISTS user_groups_workspace_group_idx
  ON user_groups (workspace_id, group_id);

COMMIT;
