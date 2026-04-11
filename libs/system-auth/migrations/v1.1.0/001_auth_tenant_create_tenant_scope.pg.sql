BEGIN;

CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DEACTIVATED')),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS tenants_slug_active_idx
  ON tenants (LOWER(slug))
  WHERE deleted_at IS NULL;

ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE email_verification_tokens ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE password_reset_tokens ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE magic_link_tokens ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE workspace_members ADD COLUMN IF NOT EXISTS tenant_id UUID;

INSERT INTO tenants (id, name, slug, description, version)
SELECT
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Default Tenant',
  'default-tenant',
  'Backfilled tenant for pre-tenant Ikary data.',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM tenants WHERE id = '00000000-0000-0000-0000-000000000001'::uuid
);

UPDATE workspaces
SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE tenant_id IS NULL;

UPDATE refresh_tokens rt
SET tenant_id = w.tenant_id
FROM workspaces w
WHERE rt.workspace_id = w.id
  AND rt.tenant_id IS NULL;

UPDATE email_verification_tokens evt
SET tenant_id = w.tenant_id
FROM workspaces w
WHERE evt.workspace_id = w.id
  AND evt.tenant_id IS NULL;

UPDATE password_reset_tokens prt
SET tenant_id = w.tenant_id
FROM workspaces w
WHERE prt.workspace_id = w.id
  AND prt.tenant_id IS NULL;

UPDATE magic_link_tokens mlt
SET tenant_id = w.tenant_id
FROM workspaces w
WHERE mlt.workspace_id = w.id
  AND mlt.tenant_id IS NULL;

UPDATE workspace_members wm
SET tenant_id = w.tenant_id
FROM workspaces w
WHERE wm.workspace_id = w.id
  AND wm.tenant_id IS NULL;

ALTER TABLE workspaces ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE refresh_tokens ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE email_verification_tokens ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE password_reset_tokens ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE magic_link_tokens ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE workspace_members ALTER COLUMN tenant_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'workspaces_tenant_fk'
  ) THEN
    ALTER TABLE workspaces
      ADD CONSTRAINT workspaces_tenant_fk
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'refresh_tokens_tenant_fk'
  ) THEN
    ALTER TABLE refresh_tokens
      ADD CONSTRAINT refresh_tokens_tenant_fk
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'email_verification_tokens_tenant_fk'
  ) THEN
    ALTER TABLE email_verification_tokens
      ADD CONSTRAINT email_verification_tokens_tenant_fk
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'password_reset_tokens_tenant_fk'
  ) THEN
    ALTER TABLE password_reset_tokens
      ADD CONSTRAINT password_reset_tokens_tenant_fk
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'magic_link_tokens_tenant_fk'
  ) THEN
    ALTER TABLE magic_link_tokens
      ADD CONSTRAINT magic_link_tokens_tenant_fk
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'workspace_members_tenant_fk'
  ) THEN
    ALTER TABLE workspace_members
      ADD CONSTRAINT workspace_members_tenant_fk
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS tenant_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
  role_code VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (tenant_id, user_id)
);

INSERT INTO tenant_members (tenant_id, user_id, status, role_code)
SELECT DISTINCT w.tenant_id, wm.user_id, 'active', wm.role_code
FROM workspace_members wm
INNER JOIN workspaces w ON w.id = wm.workspace_id
WHERE wm.deleted_at IS NULL
ON CONFLICT (tenant_id, user_id) DO NOTHING;

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

COMMIT;
