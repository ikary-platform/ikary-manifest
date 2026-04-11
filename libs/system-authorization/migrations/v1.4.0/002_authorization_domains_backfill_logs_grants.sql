BEGIN;

-- Seed LOGS domain grants for all existing WORKSPACE_OWNER and WORKSPACE_ADMIN roles.
-- WORKSPACE_OWNER gets ADMIN (4), WORKSPACE_ADMIN gets ALL (3).
-- Runs ON CONFLICT DO NOTHING so it is safe to re-apply.

INSERT INTO permission_assignments (tenant_id, workspace_id, target_type, target_id, scope_type, scope_code, access_level)
SELECT w.tenant_id, r.workspace_id, 'ROLE', r.id, 'DOMAIN', 'LOGS', 4
FROM roles r
JOIN workspaces w ON w.id = r.workspace_id
WHERE r.code = 'WORKSPACE_OWNER'
  AND r.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO permission_assignments (tenant_id, workspace_id, target_type, target_id, scope_type, scope_code, access_level)
SELECT w.tenant_id, r.workspace_id, 'ROLE', r.id, 'DOMAIN', 'LOGS', 3
FROM roles r
JOIN workspaces w ON w.id = r.workspace_id
WHERE r.code = 'WORKSPACE_ADMIN'
  AND r.deleted_at IS NULL
ON CONFLICT DO NOTHING;

COMMIT;
