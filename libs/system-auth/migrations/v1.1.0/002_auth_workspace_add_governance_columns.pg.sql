BEGIN;

ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS updated_by UUID;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS deleted_by UUID;

UPDATE workspaces
SET created_by = COALESCE(created_by, created_by_user_id),
    updated_by = COALESCE(updated_by, created_by_user_id)
WHERE created_by IS NULL OR updated_by IS NULL;

COMMIT;
