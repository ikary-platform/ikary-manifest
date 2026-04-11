-- v1.6.0: OAuth provider support
-- A. Allow OAuth users who have no password
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- B. Link users to external OAuth identities (GitHub, Google, etc.)
CREATE TABLE user_oauth_accounts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider      TEXT NOT NULL CHECK (provider IN ('github', 'google')),
  provider_user_id    TEXT NOT NULL,
  provider_email      TEXT,
  provider_display_name TEXT,
  provider_avatar_url   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_user_id)
);

CREATE INDEX idx_user_oauth_accounts_user_id ON user_oauth_accounts(user_id);

-- C. CSRF state tokens for OAuth redirect flow (short-lived, consumed after use)
CREATE TABLE oauth_state_tokens (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_hash    TEXT NOT NULL UNIQUE,
  provider      TEXT NOT NULL CHECK (provider IN ('github', 'google')),
  redirect_uri  TEXT,
  code_verifier TEXT,
  metadata      JSONB,
  expires_at    TIMESTAMPTZ NOT NULL,
  consumed_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
