BEGIN;

-- Add per-tenant profile and invitation tracking fields
ALTER TABLE tenant_members ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);
ALTER TABLE tenant_members ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE tenant_members ADD COLUMN IF NOT EXISTS invited_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add 'revoked' to the status check constraint
ALTER TABLE tenant_members DROP CONSTRAINT IF EXISTS tenant_members_status_check;
ALTER TABLE tenant_members ADD CONSTRAINT tenant_members_status_check
  CHECK (status IN ('active', 'invited', 'suspended', 'revoked'));

COMMIT;
