-- SQLite variant of 001_auth_tenant_create_tenant_scope
-- NOTE: PRAGMA foreign_keys = ON must be set by the migration runner.
--
-- SQLite limitations in this migration:
-- 1. ALTER TABLE ... ALTER COLUMN ... SET NOT NULL is not supported.
--    The app layer must enforce NOT NULL for tenant_id on existing tables.
--    For a fresh SQLite database the columns are added as NOT NULL with a
--    default after the backfill, but SQLite ADD COLUMN cannot add NOT NULL
--    without a default. We add the columns as nullable, backfill, and rely
--    on the app layer for the NOT NULL guarantee.
-- 2. ALTER TABLE ... ADD CONSTRAINT (FK) is not supported on existing tables.
--    FK relationships for tenant_id are documented but not enforced at the
--    DDL level on pre-existing tables.

CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  deleted_at TEXT,
  deleted_by TEXT REFERENCES users(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS tenants_slug_active_idx
  ON tenants (LOWER(slug))
  WHERE deleted_at IS NULL;

ALTER TABLE workspaces ADD COLUMN tenant_id TEXT;
ALTER TABLE refresh_tokens ADD COLUMN tenant_id TEXT;
ALTER TABLE email_verification_tokens ADD COLUMN tenant_id TEXT;
ALTER TABLE password_reset_tokens ADD COLUMN tenant_id TEXT;
ALTER TABLE magic_link_tokens ADD COLUMN tenant_id TEXT;
ALTER TABLE workspace_members ADD COLUMN tenant_id TEXT;

INSERT OR IGNORE INTO tenants (id, name, slug, description, version)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Default Tenant',
  'default-tenant',
  'Backfilled tenant for pre-tenant Ikary data.',
  1
);

UPDATE workspaces
SET tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE tenant_id IS NULL;

UPDATE refresh_tokens
SET tenant_id = (
  SELECT w.tenant_id FROM workspaces w WHERE w.id = refresh_tokens.workspace_id
)
WHERE tenant_id IS NULL;

UPDATE email_verification_tokens
SET tenant_id = (
  SELECT w.tenant_id FROM workspaces w WHERE w.id = email_verification_tokens.workspace_id
)
WHERE tenant_id IS NULL;

UPDATE password_reset_tokens
SET tenant_id = (
  SELECT w.tenant_id FROM workspaces w WHERE w.id = password_reset_tokens.workspace_id
)
WHERE tenant_id IS NULL;

UPDATE magic_link_tokens
SET tenant_id = (
  SELECT w.tenant_id FROM workspaces w WHERE w.id = magic_link_tokens.workspace_id
)
WHERE tenant_id IS NULL;

UPDATE workspace_members
SET tenant_id = (
  SELECT w.tenant_id FROM workspaces w WHERE w.id = workspace_members.workspace_id
)
WHERE tenant_id IS NULL;

-- SQLite cannot ALTER COLUMN to SET NOT NULL on existing columns.
-- The NOT NULL constraint for tenant_id is enforced by the app layer.

-- SQLite cannot ADD CONSTRAINT (FK) on existing tables.
-- The tenant_id -> tenants(id) FK relationships are enforced by the app layer
-- for: workspaces, refresh_tokens, email_verification_tokens,
--       password_reset_tokens, magic_link_tokens, workspace_members.

CREATE TABLE IF NOT EXISTS tenant_members (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
  role_code TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT,
  UNIQUE (tenant_id, user_id)
);

INSERT OR IGNORE INTO tenant_members (id, tenant_id, user_id, status, role_code)
SELECT
  lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' ||
  substr(lower(hex(randomblob(2))),2) || '-' ||
  substr('89ab', abs(random()) % 4 + 1, 1) ||
  substr(lower(hex(randomblob(2))),2) || '-' ||
  lower(hex(randomblob(6))),
  w.tenant_id, wm.user_id, 'active', wm.role_code
FROM workspace_members wm
INNER JOIN workspaces w ON w.id = wm.workspace_id
WHERE wm.deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS tenant_members_tenant_idx
  ON tenant_members (tenant_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS tenant_members_user_idx
  ON tenant_members (user_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS workspaces_tenant_idx
  ON workspaces (tenant_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS refresh_tokens_tenant_user_idx
  ON refresh_tokens (tenant_id, user_id);
