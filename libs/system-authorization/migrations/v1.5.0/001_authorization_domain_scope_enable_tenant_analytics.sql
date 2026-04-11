BEGIN;

ALTER TABLE permission_assignments
  DROP CONSTRAINT IF EXISTS permission_assignments_domain_must_have_workspace;

ALTER TABLE permission_assignments
  ADD CONSTRAINT permission_assignments_cell_requires_workspace
    CHECK (workspace_id IS NOT NULL OR cell_id IS NULL);

ALTER TABLE permission_assignments
  ADD CONSTRAINT permission_assignments_tenant_domain_user_only
    CHECK (scope_type <> 'DOMAIN' OR workspace_id IS NOT NULL OR target_type = 'USER');

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM domains WHERE code = 'ANALYTICS') THEN
    INSERT INTO domains (code, description)
    VALUES ('ANALYTICS', 'Analytics and observability dashboards');
  END IF;
END $$;

UPDATE permission_assignments
SET scope_code = 'ANALYTICS'
WHERE scope_type = 'DOMAIN'
  AND scope_code = 'METRICS';

DELETE FROM domains
WHERE code = 'METRICS';

INSERT INTO permission_assignments (
  tenant_id,
  workspace_id,
  cell_id,
  target_type,
  target_id,
  scope_type,
  scope_code,
  access_level
)
SELECT
  source.tenant_id,
  NULL,
  NULL,
  'USER',
  source.user_id,
  'DOMAIN',
  'ANALYTICS',
  source.access_level
FROM (
  SELECT
    ur.tenant_id,
    ur.user_id,
    MAX(pa.access_level) AS access_level
  FROM user_roles ur
  INNER JOIN permission_assignments pa
    ON pa.target_type = 'ROLE'
   AND pa.target_id = ur.role_id
   AND pa.scope_type = 'DOMAIN'
   AND pa.scope_code = 'ANALYTICS'
  GROUP BY ur.tenant_id, ur.user_id
) AS source
WHERE NOT EXISTS (
  SELECT 1
  FROM permission_assignments existing
  WHERE existing.tenant_id = source.tenant_id
    AND existing.workspace_id IS NULL
    AND existing.cell_id IS NULL
    AND existing.target_type = 'USER'
    AND existing.target_id = source.user_id
    AND existing.scope_type = 'DOMAIN'
    AND existing.scope_code = 'ANALYTICS'
);

COMMIT;
