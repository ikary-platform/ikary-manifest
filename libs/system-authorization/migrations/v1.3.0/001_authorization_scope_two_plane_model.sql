BEGIN;

-- ============================================================
-- Two-plane permission model: FEATURE vs DOMAIN separation
-- FEATURE: can be tenant-scoped (workspace_id = NULL)
-- DOMAIN:  always workspace-scoped (enforced by CHECK)
-- ============================================================

-- 1. Drop FK constraint and NOT NULL on permission_assignments.workspace_id
ALTER TABLE permission_assignments
  DROP CONSTRAINT IF EXISTS permission_assignments_workspace_fk;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'permission_assignments_workspace_id_fkey'
      AND table_name = 'permission_assignments'
  ) THEN
    ALTER TABLE permission_assignments DROP CONSTRAINT permission_assignments_workspace_id_fkey;
  END IF;
END $$;

ALTER TABLE permission_assignments
  ALTER COLUMN workspace_id DROP NOT NULL;

-- 2. Re-add FK as deferrable (NULLs are not constrained by FK)
ALTER TABLE permission_assignments
  ADD CONSTRAINT permission_assignments_workspace_fk
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- 3. THE KEY CONSTRAINT: DOMAIN permissions must always have workspace_id
ALTER TABLE permission_assignments
  ADD CONSTRAINT permission_assignments_domain_must_have_workspace
    CHECK (scope_type = 'FEATURE' OR workspace_id IS NOT NULL);

-- 4. Drop old unique constraint and recreate as expression-based index
--    to handle NULL workspace_id correctly (NULL != NULL in standard UNIQUE)
ALTER TABLE permission_assignments DROP CONSTRAINT IF EXISTS permission_assignments_unique;

CREATE UNIQUE INDEX IF NOT EXISTS permission_assignments_unique_idx
  ON permission_assignments (
    tenant_id,
    COALESCE(workspace_id, '00000000-0000-0000-0000-000000000000'::uuid),
    COALESCE(cell_id,      '00000000-0000-0000-0000-000000000000'::uuid),
    target_type,
    target_id,
    scope_type,
    scope_code
  );

-- 5. Drop FK and NOT NULL on user_roles.workspace_id (tenant-scope roles)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_roles_workspace_id_fkey'
      AND table_name = 'user_roles'
  ) THEN
    ALTER TABLE user_roles DROP CONSTRAINT user_roles_workspace_id_fkey;
  END IF;
END $$;

ALTER TABLE user_roles
  DROP CONSTRAINT IF EXISTS user_roles_workspace_role_fk,
  DROP CONSTRAINT IF EXISTS user_roles_unique;

ALTER TABLE user_roles
  ALTER COLUMN workspace_id DROP NOT NULL;

-- 6. Partial index for FK integrity when workspace_id IS NOT NULL
CREATE INDEX IF NOT EXISTS user_roles_workspace_fk_idx
  ON user_roles (workspace_id)
  WHERE workspace_id IS NOT NULL;

-- 7. Fix user_roles unique constraint to handle NULL workspace_id
CREATE UNIQUE INDEX IF NOT EXISTS user_roles_unique_idx
  ON user_roles (
    tenant_id,
    COALESCE(workspace_id, '00000000-0000-0000-0000-000000000000'::uuid),
    user_id,
    role_id
  );

-- 8. Lift access_level range to 4 for ADMIN level
ALTER TABLE permission_assignments DROP CONSTRAINT IF EXISTS permission_assignments_access_level_check;
ALTER TABLE permission_assignments
  ADD CONSTRAINT permission_assignments_access_level_check
    CHECK (access_level BETWEEN 0 AND 4);

-- 9. Update trigger to handle NULL workspace_id for tenant-scope FEATURE assignments
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
    -- For tenant-scope FEATURE assignments, workspace_id may be NULL; skip workspace check
    IF NEW.workspace_id IS NOT NULL THEN
      PERFORM 1
      FROM roles r
      WHERE r.id = NEW.target_id
        AND r.workspace_id = NEW.workspace_id
        AND r.deleted_at IS NULL;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Permission assignment target role does not exist in workspace: %', NEW.target_id;
      END IF;
    END IF;
  ELSIF NEW.target_type = 'GROUP' THEN
    IF NEW.workspace_id IS NOT NULL THEN
      PERFORM 1
      FROM groups g
      WHERE g.id = NEW.target_id
        AND g.workspace_id = NEW.workspace_id
        AND g.deleted_at IS NULL;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Permission assignment target group does not exist in workspace: %', NEW.target_id;
      END IF;
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

COMMIT;
