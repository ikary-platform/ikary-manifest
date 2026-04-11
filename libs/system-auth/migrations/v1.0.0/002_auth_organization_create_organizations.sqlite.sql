-- SQLite variant of 002_auth_organization_create_organizations
-- NOTE: PRAGMA foreign_keys = ON must be set by the migration runner.

CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS workspaces_slug_active_idx
  ON workspaces (LOWER(slug))
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS workspaces_creator_idx
  ON workspaces (created_by_user_id)
  WHERE deleted_at IS NULL;

-- SQLite does not support ADD CONSTRAINT for foreign keys on existing tables.
-- The FK columns (workspace_id) in refresh_tokens, email_verification_tokens,
-- password_reset_tokens, and magic_link_tokens reference workspaces(id) by
-- convention. The app layer enforces referential integrity for these
-- retroactive FK constraints; they were already created without FK in migration 001.
