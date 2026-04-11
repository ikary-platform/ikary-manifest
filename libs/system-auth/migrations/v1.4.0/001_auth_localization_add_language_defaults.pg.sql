BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(16);

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS default_language VARCHAR(16);

UPDATE tenants
SET default_language = 'en'
WHERE default_language IS NULL;

ALTER TABLE tenants
  ALTER COLUMN default_language SET NOT NULL;

ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS default_language VARCHAR(16);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_preferred_language_format_chk'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_preferred_language_format_chk
      CHECK (preferred_language IS NULL OR preferred_language ~ '^[a-z]{2}(?:-[A-Z]{2})?$');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tenants_default_language_format_chk'
  ) THEN
    ALTER TABLE tenants
      ADD CONSTRAINT tenants_default_language_format_chk
      CHECK (default_language ~ '^[a-z]{2}(?:-[A-Z]{2})?$');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'workspaces_default_language_format_chk'
  ) THEN
    ALTER TABLE workspaces
      ADD CONSTRAINT workspaces_default_language_format_chk
      CHECK (default_language IS NULL OR default_language ~ '^[a-z]{2}(?:-[A-Z]{2})?$');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS users_preferred_language_idx
  ON users (preferred_language)
  WHERE preferred_language IS NOT NULL;

CREATE INDEX IF NOT EXISTS workspaces_default_language_idx
  ON workspaces (tenant_id, default_language)
  WHERE default_language IS NOT NULL;

COMMIT;
