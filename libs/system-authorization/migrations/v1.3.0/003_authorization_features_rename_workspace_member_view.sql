BEGIN;

-- Rename WORKSPACE.MEMBER.VIEW to WORKSPACE_MEMBER_VIEW (SCREAMING_SNAKE_CASE convention)
INSERT INTO features (code, description)
VALUES ('WORKSPACE_MEMBER_VIEW', 'View workspace members and invitations')
ON CONFLICT (code) DO NOTHING;

UPDATE permission_assignments
SET scope_code = 'WORKSPACE_MEMBER_VIEW'
WHERE scope_code = 'WORKSPACE.MEMBER.VIEW';

DELETE FROM features WHERE code = 'WORKSPACE.MEMBER.VIEW';

COMMIT;
