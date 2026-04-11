BEGIN;

INSERT INTO features (code, description)
VALUES
  ('WORKSPACE_MEMBER_INVITE', 'Invite members to a workspace'),
  ('WORKSPACE_MEMBER_REMOVE', 'Remove members from a workspace'),
  ('WORKSPACE_ROLE_ASSIGN',   'Assign roles to workspace members'),
  ('WORKSPACE_ROLE_MANAGE',   'Create, update, and delete workspace roles')
ON CONFLICT (code) DO NOTHING;

COMMIT;
