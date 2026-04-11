BEGIN;

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  code VARCHAR(150) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT roles_code_uppercase_chk CHECK (code = UPPER(code)),
  CONSTRAINT roles_workspace_id_id_unique UNIQUE (workspace_id, id)
);

CREATE UNIQUE INDEX IF NOT EXISTS roles_workspace_code_active_unique_idx
  ON roles (workspace_id, code)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS roles_workspace_idx
  ON roles (workspace_id)
  WHERE deleted_at IS NULL;

COMMIT;
