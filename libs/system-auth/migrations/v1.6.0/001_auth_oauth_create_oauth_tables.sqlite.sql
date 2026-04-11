-- SQLite variant of 001_auth_oauth_create_oauth_tables
-- NOTE: PRAGMA foreign_keys = ON must be set by the migration runner.
--
-- SQLite limitation: ALTER COLUMN ... DROP NOT NULL is not supported.
-- To allow OAuth users without a password, the app layer must treat
-- users.password_hash as nullable. If the users table was created with
-- NOT NULL on password_hash, a table rebuild would be required in SQLite.
-- For a fresh SQLite database this is handled by migration 001 being
-- written with password_hash TEXT NOT NULL; the app layer should permit
-- NULL when inserting OAuth-only users, or the column can be rebuilt.
-- Workaround: recreate the users table without NOT NULL on password_hash,
-- copy data, and swap. Left as a comment since this is destructive:
--
-- CREATE TABLE users_new AS SELECT * FROM users;
-- DROP TABLE users;
-- CREATE TABLE users ( ... password_hash TEXT, ... );
-- INSERT INTO users SELECT * FROM users_new;
-- DROP TABLE users_new;

-- B. Link users to external OAuth identities (GitHub, Google, etc.)
CREATE TABLE IF NOT EXISTS user_oauth_accounts (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider      TEXT NOT NULL CHECK (provider IN ('github', 'google')),
  provider_user_id    TEXT NOT NULL,
  provider_email      TEXT,
  provider_display_name TEXT,
  provider_avatar_url   TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (provider, provider_user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_oauth_accounts_user_id
  ON user_oauth_accounts(user_id);

-- C. CSRF state tokens for OAuth redirect flow (short-lived, consumed after use)
CREATE TABLE IF NOT EXISTS oauth_state_tokens (
  id            TEXT PRIMARY KEY,
  state_hash    TEXT NOT NULL UNIQUE,
  provider      TEXT NOT NULL CHECK (provider IN ('github', 'google')),
  redirect_uri  TEXT,
  code_verifier TEXT,
  metadata      TEXT,
  expires_at    TEXT NOT NULL,
  consumed_at   TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
