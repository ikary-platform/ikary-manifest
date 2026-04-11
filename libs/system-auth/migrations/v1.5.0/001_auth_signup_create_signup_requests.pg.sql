CREATE TABLE IF NOT EXISTS signup_requests (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  email        VARCHAR(320) NOT NULL,
  code_hash    TEXT         NOT NULL,
  expires_at   TIMESTAMPTZ  NOT NULL,
  consumed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX signup_requests_email_idx ON signup_requests (LOWER(email)) WHERE consumed_at IS NULL;
