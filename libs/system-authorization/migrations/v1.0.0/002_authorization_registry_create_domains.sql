BEGIN;

CREATE TABLE IF NOT EXISTS domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(150) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT domains_code_uppercase_chk CHECK (code = UPPER(code))
);

CREATE UNIQUE INDEX IF NOT EXISTS domains_code_unique_idx
  ON domains (code);

COMMIT;
