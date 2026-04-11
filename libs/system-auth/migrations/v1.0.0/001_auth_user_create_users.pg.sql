BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(320) NOT NULL,
  password_hash TEXT NOT NULL,
  is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  email_verified_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_active_idx
  ON users (LOWER(email))
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jti UUID NOT NULL UNIQUE,
  workspace_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  replaced_by_jti UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS refresh_tokens_org_user_idx
  ON refresh_tokens (workspace_id, user_id);

CREATE INDEX IF NOT EXISTS refresh_tokens_active_idx
  ON refresh_tokens (workspace_id, user_id, expires_at)
  WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  strategy VARCHAR(16) NOT NULL CHECK (strategy IN ('code', 'click')),
  code_hash TEXT,
  token_hash TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (strategy = 'code' AND code_hash IS NOT NULL) OR
    (strategy = 'click' AND token_hash IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS email_verification_tokens_lookup_idx
  ON email_verification_tokens (workspace_id, user_id, strategy, expires_at)
  WHERE consumed_at IS NULL;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS password_reset_tokens_lookup_idx
  ON password_reset_tokens (workspace_id, user_id, expires_at)
  WHERE consumed_at IS NULL;

CREATE TABLE IF NOT EXISTS magic_link_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS magic_link_tokens_lookup_idx
  ON magic_link_tokens (workspace_id, user_id, expires_at)
  WHERE consumed_at IS NULL;

COMMIT;
