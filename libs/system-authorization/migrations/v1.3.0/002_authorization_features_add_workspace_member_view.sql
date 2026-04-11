BEGIN;

INSERT INTO features (code, description)
VALUES
  ('WORKSPACE_SETTINGS',     'Configure workspace settings'),
  ('WORKSPACE_BRANDING',     'Manage workspace branding'),
  ('WORKSPACE_CREATE',       'Create new workspaces'),
  ('CELL_VIEW',              'View cells in a workspace'),
  ('CELL_REGISTER',          'Register new cells in a workspace'),
  ('WORKSPACE_MEMBER_VIEW',  'View workspace members and invitations')
ON CONFLICT (code) DO NOTHING;

COMMIT;
