BEGIN;

-- Grant LOGS domain access to every role that already holds at least one other
-- DOMAIN grant, preserving the highest access_level that role has on any domain.
-- ON CONFLICT DO NOTHING makes this idempotent.

INSERT INTO permission_assignments (tenant_id, workspace_id, target_type, target_id, scope_type, scope_code, access_level)
SELECT DISTINCT ON (pa.target_id)
  pa.tenant_id,
  pa.workspace_id,
  pa.target_type,
  pa.target_id,
  'DOMAIN',
  'LOGS',
  MAX(pa.access_level) OVER (PARTITION BY pa.target_id)
FROM permission_assignments pa
WHERE pa.scope_type = 'DOMAIN'
  AND pa.target_type = 'ROLE'
  AND NOT EXISTS (
    SELECT 1
    FROM permission_assignments existing
    WHERE existing.target_id  = pa.target_id
      AND existing.scope_type = 'DOMAIN'
      AND existing.scope_code = 'LOGS'
  )
ON CONFLICT DO NOTHING;

COMMIT;
