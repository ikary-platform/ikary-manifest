BEGIN;

CREATE TABLE IF NOT EXISTS permission_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  target_type VARCHAR(16) NOT NULL CHECK (target_type IN ('USER', 'ROLE', 'GROUP')),
  target_id UUID NOT NULL,
  scope_type VARCHAR(16) NOT NULL CHECK (scope_type IN ('FEATURE', 'DOMAIN')),
  scope_code VARCHAR(150) NOT NULL,
  access_level SMALLINT NOT NULL CHECK (access_level BETWEEN 0 AND 3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT permission_assignments_scope_uppercase_chk CHECK (scope_code = UPPER(scope_code)),
  CONSTRAINT permission_assignments_unique
    UNIQUE (workspace_id, target_type, target_id, scope_type, scope_code)
);

CREATE INDEX IF NOT EXISTS permission_assignments_workspace_idx
  ON permission_assignments (workspace_id);

CREATE INDEX IF NOT EXISTS permission_assignments_target_idx
  ON permission_assignments (workspace_id, target_type, target_id);

CREATE INDEX IF NOT EXISTS permission_assignments_scope_idx
  ON permission_assignments (workspace_id, scope_type, scope_code);

CREATE OR REPLACE FUNCTION validate_permission_assignment_refs()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.scope_code := UPPER(NEW.scope_code);

  IF NEW.target_type = 'USER' THEN
    PERFORM 1
    FROM users u
    WHERE u.id = NEW.target_id
      AND u.deleted_at IS NULL;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Permission assignment target user does not exist: %', NEW.target_id;
    END IF;
  ELSIF NEW.target_type = 'ROLE' THEN
    PERFORM 1
    FROM roles r
    WHERE r.id = NEW.target_id
      AND r.workspace_id = NEW.workspace_id
      AND r.deleted_at IS NULL;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Permission assignment target role does not exist in workspace: %', NEW.target_id;
    END IF;
  ELSIF NEW.target_type = 'GROUP' THEN
    PERFORM 1
    FROM groups g
    WHERE g.id = NEW.target_id
      AND g.workspace_id = NEW.workspace_id
      AND g.deleted_at IS NULL;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Permission assignment target group does not exist in workspace: %', NEW.target_id;
    END IF;
  END IF;

  IF NEW.scope_type = 'FEATURE' THEN
    PERFORM 1
    FROM features f
    WHERE f.code = NEW.scope_code;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Feature scope code does not exist: %', NEW.scope_code;
    END IF;
  ELSIF NEW.scope_type = 'DOMAIN' THEN
    PERFORM 1
    FROM domains d
    WHERE d.code = NEW.scope_code;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Domain scope code does not exist: %', NEW.scope_code;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS permission_assignments_validate_refs_trg ON permission_assignments;

CREATE TRIGGER permission_assignments_validate_refs_trg
  BEFORE INSERT OR UPDATE ON permission_assignments
  FOR EACH ROW
  EXECUTE FUNCTION validate_permission_assignment_refs();

COMMIT;
