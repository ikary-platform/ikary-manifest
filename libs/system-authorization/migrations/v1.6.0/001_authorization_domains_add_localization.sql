BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM domains WHERE code = 'LOCALIZATION') THEN
    INSERT INTO domains (code, description)
    VALUES ('LOCALIZATION', 'Translation and localization governance');
  END IF;
END $$;

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
  pa.tenant_id,
  pa.workspace_id,
  pa.cell_id,
  pa.target_type,
  pa.target_id,
  pa.scope_type,
  'LOCALIZATION',
  pa.access_level
FROM permission_assignments pa
WHERE pa.scope_type = 'DOMAIN'
  AND pa.scope_code = 'ANALYTICS'
  AND NOT EXISTS (
    SELECT 1
    FROM permission_assignments existing
    WHERE existing.tenant_id = pa.tenant_id
      AND existing.workspace_id IS NOT DISTINCT FROM pa.workspace_id
      AND existing.cell_id IS NOT DISTINCT FROM pa.cell_id
      AND existing.target_type = pa.target_type
      AND existing.target_id = pa.target_id
      AND existing.scope_type = 'DOMAIN'
      AND existing.scope_code = 'LOCALIZATION'
  );

COMMIT;
