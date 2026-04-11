-- SQLite variant of 001_auth_tenant_member_extend
-- NOTE: PRAGMA foreign_keys = ON must be set by the migration runner.
--
-- SQLite cannot DROP CONSTRAINT or ADD CONSTRAINT on an existing table.
-- The updated status CHECK ('active','invited','suspended','revoked') is
-- enforced by the app layer for the tenant_members table.

ALTER TABLE tenant_members ADD COLUMN display_name TEXT;
ALTER TABLE tenant_members ADD COLUMN avatar_url TEXT;
ALTER TABLE tenant_members ADD COLUMN invited_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;

-- SQLite: Cannot drop and re-add CHECK constraints on existing tables.
-- The expanded status enum ('active','invited','suspended','revoked') must be
-- enforced by the app layer.
