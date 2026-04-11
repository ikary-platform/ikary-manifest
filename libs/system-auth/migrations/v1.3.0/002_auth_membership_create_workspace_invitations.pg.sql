BEGIN;

CREATE TABLE IF NOT EXISTS workspace_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  invitee_email VARCHAR(320) NOT NULL,
  invitee_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  invitee_tenant_member_id UUID REFERENCES tenant_members(id) ON DELETE SET NULL,
  invited_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  workspace_member_id UUID REFERENCES workspace_members(id) ON DELETE CASCADE,
  invited_role VARCHAR(100) NOT NULL,
  token_hash TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'revoked')),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS workspace_invitations_pending_email_idx
  ON workspace_invitations (workspace_id, LOWER(invitee_email))
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS workspace_invitations_token_hash_idx
  ON workspace_invitations (token_hash)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS workspace_invitations_workspace_idx
  ON workspace_invitations (workspace_id, status);

COMMIT;
