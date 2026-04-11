BEGIN;

ALTER TABLE roles ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE user_groups ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE permission_assignments ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE permission_assignments ADD COLUMN IF NOT EXISTS cell_id UUID;

UPDATE roles r
SET tenant_id = w.tenant_id
FROM workspaces w
WHERE r.workspace_id = w.id
  AND r.tenant_id IS NULL;

UPDATE groups g
SET tenant_id = w.tenant_id
FROM workspaces w
WHERE g.workspace_id = w.id
  AND g.tenant_id IS NULL;

UPDATE user_roles ur
SET tenant_id = w.tenant_id
FROM workspaces w
WHERE ur.workspace_id = w.id
  AND ur.tenant_id IS NULL;

UPDATE user_groups ug
SET tenant_id = w.tenant_id
FROM workspaces w
WHERE ug.workspace_id = w.id
  AND ug.tenant_id IS NULL;

UPDATE permission_assignments pa
SET tenant_id = w.tenant_id
FROM workspaces w
WHERE pa.workspace_id = w.id
  AND pa.tenant_id IS NULL;

ALTER TABLE roles ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE groups ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE user_roles ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE user_groups ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE permission_assignments ALTER COLUMN tenant_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'roles_tenant_fk') THEN
    ALTER TABLE roles ADD CONSTRAINT roles_tenant_fk FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'groups_tenant_fk') THEN
    ALTER TABLE groups ADD CONSTRAINT groups_tenant_fk FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_tenant_fk') THEN
    ALTER TABLE user_roles ADD CONSTRAINT user_roles_tenant_fk FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_groups_tenant_fk') THEN
    ALTER TABLE user_groups ADD CONSTRAINT user_groups_tenant_fk FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'permission_assignments_tenant_fk') THEN
    ALTER TABLE permission_assignments ADD CONSTRAINT permission_assignments_tenant_fk FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS roles_tenant_idx ON roles (tenant_id);
CREATE INDEX IF NOT EXISTS groups_tenant_idx ON groups (tenant_id);
CREATE INDEX IF NOT EXISTS user_roles_tenant_idx ON user_roles (tenant_id, user_id);
CREATE INDEX IF NOT EXISTS user_groups_tenant_idx ON user_groups (tenant_id, user_id);
CREATE INDEX IF NOT EXISTS permission_assignments_tenant_idx ON permission_assignments (tenant_id, target_type, target_id);

COMMIT;
