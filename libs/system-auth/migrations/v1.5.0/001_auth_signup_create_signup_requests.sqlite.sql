-- SQLite variant of 001_auth_signup_create_signup_requests

CREATE TABLE IF NOT EXISTS signup_requests (
  id           TEXT PRIMARY KEY,
  email        TEXT NOT NULL,
  code_hash    TEXT NOT NULL,
  expires_at   TEXT NOT NULL,
  consumed_at  TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS signup_requests_email_idx
  ON signup_requests (LOWER(email))
  WHERE consumed_at IS NULL;
