BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(150) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT features_code_uppercase_chk CHECK (code = UPPER(code))
);

CREATE UNIQUE INDEX IF NOT EXISTS features_code_unique_idx
  ON features (code);

COMMIT;
