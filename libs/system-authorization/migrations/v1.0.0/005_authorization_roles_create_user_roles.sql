BEGIN;

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_roles_workspace_role_fk
    FOREIGN KEY (workspace_id, role_id) REFERENCES roles(workspace_id, id) ON DELETE CASCADE,
  CONSTRAINT user_roles_unique UNIQUE (workspace_id, user_id, role_id)
);

CREATE INDEX IF NOT EXISTS user_roles_workspace_user_idx
  ON user_roles (workspace_id, user_id);

CREATE INDEX IF NOT EXISTS user_roles_workspace_role_idx
  ON user_roles (workspace_id, role_id);

COMMIT;
