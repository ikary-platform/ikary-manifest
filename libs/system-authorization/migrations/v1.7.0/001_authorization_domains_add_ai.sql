BEGIN;

INSERT INTO domains (code, description)
VALUES
  ('CONFIGURATION', 'Runtime configuration management for tenant, workspace, and cell scopes'),
  ('AI', 'AI task execution, RAG queries, and knowledge management')
ON CONFLICT (code) DO NOTHING;

INSERT INTO features (code, description)
VALUES
  ('AI_TASKS_EXECUTE', 'Execute AI tasks'),
  ('AI_KNOWLEDGE_MANAGE', 'Manage knowledge sources'),
  ('AI_USAGE_VIEW', 'View AI usage analytics'),
  ('CONFIGURATION_VIEW', 'View configuration values'),
  ('CONFIGURATION_EDIT', 'Set and delete configuration values')
ON CONFLICT (code) DO NOTHING;

COMMIT;
