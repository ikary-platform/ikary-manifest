import { test, expect, vi } from 'vitest';
import { HashService } from '../../common/hash.service';
import { SsoSessionService } from './sso-session.service';

// ── Helpers ───────────────────────────────────────────────────────────────────

const hashService = new HashService();
const authConfig = {
  config: { jwt: { tokenHashSecret: 'test-hash-secret-32chars-ok!!' } },
} as never;

function makeChain(opts: { selectRow?: unknown } = {}) {
  const chain: any = {
    select: () => chain,
    where: () => chain,
    set: () => chain,
    values: vi.fn(),
    execute: vi.fn().mockResolvedValue(undefined),
    executeTakeFirst: vi.fn().mockResolvedValue(opts.selectRow),
  };
  chain.values.mockReturnValue(chain); // chain must exist before mockReturnValue can reference it
  return chain;
}

function makeDb(opts: { selectRow?: unknown } = {}) {
  const chain = makeChain(opts);
  const db = {
    db: {
      insertInto: vi.fn().mockReturnValue(chain),
      selectFrom: vi.fn().mockReturnValue(chain),
      updateTable: vi.fn().mockReturnValue(chain),
    },
  };
  return { db, chain };
}

function makeService(opts: { selectRow?: unknown } = {}) {
  const { db, chain } = makeDb(opts);
  const service = new SsoSessionService(db as never, hashService, authConfig);
  return { service, db, chain };
}

// ── createSession ─────────────────────────────────────────────────────────────

test('createSession returns a non-empty raw token string', async () => {
  const { service } = makeService();
  const token = await service.createSession({ userId: 'u1', tenantId: 't1', workspaceId: 'w1' });
  expect(typeof token).toBe('string');
  expect(token.length).toBeGreaterThan(0);
});

test('createSession stores the hashed token in the DB, not the raw token', async () => {
  const { service, chain } = makeService();
  const token = await service.createSession({ userId: 'u1', tenantId: 't1', workspaceId: 'w1' });
  const stored = chain.values.mock.calls[0][0] as { token_hash: string };
  expect(stored.token_hash).not.toBe(token);
  expect(stored.token_hash).toBe(hashService.hashOpaqueToken(token, 'test-hash-secret-32chars-ok!!'));
});

// ── validateSession ───────────────────────────────────────────────────────────

test('validateSession returns claims for a valid non-expired non-revoked session', async () => {
  const { service } = makeService({
    selectRow: {
      user_id: 'u1',
      tenant_id: 't1',
      workspace_id: 'w1',
      expires_at: new Date(Date.now() + 60_000),
      revoked_at: null,
    },
  });
  const claims = await service.validateSession('raw-token');
  expect(claims).toEqual({ userId: 'u1', tenantId: 't1', workspaceId: 'w1' });
});

test('validateSession returns null when no matching row is found', async () => {
  const { service } = makeService({ selectRow: undefined });
  expect(await service.validateSession('raw-token')).toBeNull();
});

test('validateSession returns null when session is revoked', async () => {
  const { service } = makeService({
    selectRow: {
      user_id: 'u1',
      tenant_id: 't1',
      workspace_id: 'w1',
      expires_at: new Date(Date.now() + 60_000),
      revoked_at: new Date(),
    },
  });
  expect(await service.validateSession('raw-token')).toBeNull();
});

test('validateSession returns null when session is expired', async () => {
  const { service } = makeService({
    selectRow: {
      user_id: 'u1',
      tenant_id: 't1',
      workspace_id: 'w1',
      expires_at: new Date(Date.now() - 1_000),
      revoked_at: null,
    },
  });
  expect(await service.validateSession('raw-token')).toBeNull();
});

// ── revokeSession ─────────────────────────────────────────────────────────────

test('revokeSession updates the sso_sessions table', async () => {
  const { service, db } = makeService();
  await service.revokeSession('raw-token');
  expect(db.db.updateTable).toHaveBeenCalledWith('sso_sessions');
});

// ── revokeAllUserSessions ─────────────────────────────────────────────────────

test('revokeAllUserSessions updates the sso_sessions table for the given user and tenant', async () => {
  const { service, db } = makeService();
  await service.revokeAllUserSessions('u1', 't1');
  expect(db.db.updateTable).toHaveBeenCalledWith('sso_sessions');
});
