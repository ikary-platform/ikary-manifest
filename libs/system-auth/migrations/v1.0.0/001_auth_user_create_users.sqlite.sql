-- SQLite variant of 001_auth_user_create_users
-- NOTE: PRAGMA foreign_keys = ON must be set by the migration runner.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_email_verified INTEGER NOT NULL DEFAULT 0,
  email_verified_at TEXT,
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_active_idx
  ON users (LOWER(email))
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id TEXT PRIMARY KEY,
  jti TEXT NOT NULL UNIQUE,
  workspace_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  issued_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  replaced_by_jti TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS refresh_tokens_org_user_idx
  ON refresh_tokens (workspace_id, user_id);

CREATE INDEX IF NOT EXISTS refresh_tokens_active_idx
  ON refresh_tokens (workspace_id, user_id, expires_at)
  WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  strategy TEXT NOT NULL CHECK (strategy IN ('code', 'click')),
  code_hash TEXT,
  token_hash TEXT,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (
    (strategy = 'code' AND code_hash IS NOT NULL) OR
    (strategy = 'click' AND token_hash IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS email_verification_tokens_lookup_idx
  ON email_verification_tokens (workspace_id, user_id, strategy, expires_at)
  WHERE consumed_at IS NULL;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS password_reset_tokens_lookup_idx
  ON password_reset_tokens (workspace_id, user_id, expires_at)
  WHERE consumed_at IS NULL;

CREATE TABLE IF NOT EXISTS magic_link_tokens (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS magic_link_tokens_lookup_idx
  ON magic_link_tokens (workspace_id, user_id, expires_at)
  WHERE consumed_at IS NULL;
