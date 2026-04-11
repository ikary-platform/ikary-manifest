-- SQLite variant of 001_auth_localization_add_language_defaults
-- NOTE: PRAGMA foreign_keys = ON must be set by the migration runner.
--
-- SQLite limitations in this migration:
-- 1. ALTER COLUMN ... SET NOT NULL is not supported. The NOT NULL constraint
--    for tenants.default_language is enforced by the app layer.
-- 2. ADD CONSTRAINT with regex CHECK is not supported in SQLite. The
--    language format validation ('^[a-z]{2}(?:-[A-Z]{2})?$') is enforced
--    by the app layer.

ALTER TABLE users
  ADD COLUMN preferred_language TEXT;

ALTER TABLE tenants
  ADD COLUMN default_language TEXT;

UPDATE tenants
SET default_language = 'en'
WHERE default_language IS NULL;

-- SQLite: Cannot ALTER COLUMN to SET NOT NULL.
-- tenants.default_language NOT NULL is enforced by the app layer.

ALTER TABLE workspaces
  ADD COLUMN default_language TEXT;

-- SQLite: Cannot add CHECK constraints with regex patterns.
-- Language format validation (e.g. 'en', 'fr-CA') is enforced by the app layer
-- for: users.preferred_language, tenants.default_language, workspaces.default_language.

CREATE INDEX IF NOT EXISTS users_preferred_language_idx
  ON users (preferred_language)
  WHERE preferred_language IS NOT NULL;

CREATE INDEX IF NOT EXISTS workspaces_default_language_idx
  ON workspaces (tenant_id, default_language)
  WHERE default_language IS NOT NULL;
