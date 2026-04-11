BEGIN;

CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  description TEXT,
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS workspaces_slug_active_idx
  ON workspaces (LOWER(slug))
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS workspaces_creator_idx
  ON workspaces (created_by_user_id)
  WHERE deleted_at IS NULL;

ALTER TABLE refresh_tokens
  ADD CONSTRAINT refresh_tokens_workspace_fk
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

ALTER TABLE email_verification_tokens
  ADD CONSTRAINT email_verification_tokens_workspace_fk
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

ALTER TABLE password_reset_tokens
  ADD CONSTRAINT password_reset_tokens_workspace_fk
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

ALTER TABLE magic_link_tokens
  ADD CONSTRAINT magic_link_tokens_workspace_fk
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

COMMIT;
