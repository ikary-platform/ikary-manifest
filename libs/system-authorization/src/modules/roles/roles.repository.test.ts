import { describe, expect, it, vi } from 'vitest';
import { RolesRepository } from './roles.repository';

function makeChain(rows: any[] = []) {
  const chain: any = {
    selectFrom: () => chain,
    select: () => chain,
    selectAll: () => chain,
    where: () => chain,
    orderBy: () => chain,
    limit: () => chain,
    offset: () => chain,
    innerJoin: () => chain,
    leftJoin: () => chain,
    groupBy: () => chain,
    insertInto: () => chain,
    values: () => chain,
    updateTable: () => chain,
    set: () => chain,
    deleteFrom: () => chain,
    returning: () => chain,
    returningAll: () => chain,
    onConflict: () => chain,
    execute: vi.fn().mockResolvedValue(rows),
    executeTakeFirst: vi.fn().mockResolvedValue(rows[0]),
    executeTakeFirstOrThrow: vi.fn().mockResolvedValue(rows[0]),
  };
  return chain;
}

function makeRepo(chain: ReturnType<typeof makeChain>) {
  return new RolesRepository({ db: chain } as any);
}

const ROLE_ROW = {
  id: 'role-1',
  tenant_id: 't1',
  workspace_id: 'ws1',
  code: 'CUSTOM_ROLE',
  name: 'Custom Role',
  description: null,
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
};

describe('RolesRepository.listByWorkspace', () => {
  it('returns roles for the workspace', async () => {
    const rows = [ROLE_ROW, { ...ROLE_ROW, id: 'role-2', code: 'OTHER_ROLE' }];
    const chain = makeChain(rows);
    const repo = makeRepo(chain);

    const result = await repo.listByWorkspace('t1', 'ws1');

    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe('role-1');
  });

  it('returns empty array when no roles exist', async () => {
    const chain = makeChain([]);
    const repo = makeRepo(chain);

    const result = await repo.listByWorkspace('t1', 'ws-empty');

    expect(result).toEqual([]);
  });
});

describe('RolesRepository.existsInOrg', () => {
  it('returns true when a role with matching workspaceId and roleId is found', async () => {
    const chain = makeChain([]);
    chain.executeTakeFirst = vi.fn().mockResolvedValue({ id: 'role-1' });
    const repo = makeRepo(chain);

    expect(await repo.existsInOrg('ws1', 'role-1')).toBe(true);
  });

  it('returns false when no matching role is found', async () => {
    const chain = makeChain([]);
    chain.executeTakeFirst = vi.fn().mockResolvedValue(undefined);
    const repo = makeRepo(chain);

    expect(await repo.existsInOrg('ws1', 'role-ghost')).toBe(false);
  });
});

describe('RolesRepository.softDeleteRole', () => {
  it('returns true when role was soft-deleted (numUpdatedRows > 0)', async () => {
    const chain = makeChain([]);
    chain.executeTakeFirst = vi.fn().mockResolvedValue({ numUpdatedRows: 1n });
    const repo = makeRepo(chain);

    const result = await repo.softDeleteRole({ tenantId: 't1', workspaceId: 'ws1', roleId: 'role-1' });

    expect(result).toBe(true);
  });

  it('returns false when no row was updated (role not found or already deleted)', async () => {
    const chain = makeChain([]);
    chain.executeTakeFirst = vi.fn().mockResolvedValue({ numUpdatedRows: 0n });
    const repo = makeRepo(chain);

    const result = await repo.softDeleteRole({ tenantId: 't1', workspaceId: 'ws1', roleId: 'unknown' });

    expect(result).toBe(false);
  });

  it('returns false when executeTakeFirst returns undefined', async () => {
    const chain = makeChain([]);
    chain.executeTakeFirst = vi.fn().mockResolvedValue(undefined);
    const repo = makeRepo(chain);

    const result = await repo.softDeleteRole({ tenantId: 't1', workspaceId: 'ws1', roleId: 'role-x' });

    expect(result).toBe(false);
  });
});

describe('RolesRepository.upsertRole — insert path', () => {
  it('inserts when no existing role with same workspace+code', async () => {
    const chain = makeChain([]);
    chain.executeTakeFirst = vi.fn().mockResolvedValueOnce(undefined);
    chain.executeTakeFirstOrThrow = vi.fn().mockResolvedValue(ROLE_ROW);
    const repo = makeRepo(chain);

    const result = await repo.upsertRole({ tenantId: 't1', workspaceId: 'ws1', code: 'NEW_ROLE', name: 'New Role' });

    expect(result).toEqual(ROLE_ROW);
  });
});

describe('RolesRepository.upsertRole — update path', () => {
  it('updates when an existing role with same workspace+code is found', async () => {
    const existing = { id: 'role-1' };
    const updated = { ...ROLE_ROW, name: 'Updated Name' };
    const chain = makeChain([]);
    chain.executeTakeFirst = vi.fn().mockResolvedValueOnce(existing);
    chain.executeTakeFirstOrThrow = vi.fn().mockResolvedValue(updated);
    const repo = makeRepo(chain);

    const result = await repo.upsertRole({
      tenantId: 't1',
      workspaceId: 'ws1',
      code: 'CUSTOM_ROLE',
      name: 'Updated Name',
    });

    expect(result.name).toBe('Updated Name');
  });
});

describe('RolesRepository.countActiveOwners', () => {
  it('returns parsed integer count', async () => {
    const chain = makeChain([]);
    chain.executeTakeFirst = vi.fn().mockResolvedValue({ cnt: '3' });
    const repo = makeRepo(chain);

    const result = await repo.countActiveOwners('t1', 'ws1');

    expect(result).toBe(3);
  });

  it('returns 0 when no owner row is found', async () => {
    const chain = makeChain([]);
    chain.executeTakeFirst = vi.fn().mockResolvedValue(undefined);
    const repo = makeRepo(chain);

    const result = await repo.countActiveOwners('t1', 'ws1');

    expect(result).toBe(0);
  });
});

describe('RolesRepository.assignUserRole', () => {
  it('does nothing when assignment already exists', async () => {
    const chain = makeChain([]);
    chain.executeTakeFirst = vi.fn().mockResolvedValue({ id: 'existing' });
    const repo = makeRepo(chain);

    await repo.assignUserRole({ tenantId: 't1', workspaceId: 'ws1', userId: 'u1', roleId: 'r1' });
    expect(chain.execute).not.toHaveBeenCalled();
  });

  it('inserts when no existing assignment', async () => {
    const chain = makeChain([]);
    chain.executeTakeFirst = vi.fn().mockResolvedValue(undefined);
    const repo = makeRepo(chain);

    await repo.assignUserRole({ tenantId: 't1', workspaceId: null, userId: 'u1', roleId: 'r1' });
    expect(chain.execute).toHaveBeenCalled();
  });
});

describe('RolesRepository.unassignUserRole', () => {
  it('deletes the assignment', async () => {
    const chain = makeChain([]);
    const repo = makeRepo(chain);

    await repo.unassignUserRole({ tenantId: 't1', workspaceId: null, userId: 'u1', roleId: 'r1' });
    expect(chain.execute).toHaveBeenCalled();
  });
});

describe('RolesRepository.findByCode', () => {
  it('returns the role when found', async () => {
    const chain = makeChain([]);
    chain.executeTakeFirst = vi.fn().mockResolvedValue(ROLE_ROW);
    const repo = makeRepo(chain);

    const result = await repo.findByCode('t1', 'ws1', 'CUSTOM_ROLE');
    expect(result).toEqual(ROLE_ROW);
  });

  it('returns undefined when not found', async () => {
    const chain = makeChain([]);
    chain.executeTakeFirst = vi.fn().mockResolvedValue(undefined);
    const repo = makeRepo(chain);

    expect(await repo.findByCode('t1', 'ws1', 'UNKNOWN')).toBeUndefined();
  });
});

describe('RolesRepository.getRoleIdsForUser', () => {
  it('returns role ids for the user', async () => {
    const chain = makeChain([{ role_id: 'r1' }, { role_id: 'r2' }]);
    const repo = makeRepo(chain);

    const result = await repo.getRoleIdsForUser('ws1', 'u1');
    expect(result).toEqual(['r1', 'r2']);
  });

  it('returns empty array when user has no roles', async () => {
    const chain = makeChain([]);
    const repo = makeRepo(chain);

    expect(await repo.getRoleIdsForUser('ws1', 'u-none')).toEqual([]);
  });
});

describe('RolesRepository.listMembersByRole', () => {
  it('returns mapped member records', async () => {
    const chain = makeChain([
      { user_id: 'u1', email: 'a@b.com', code: 'ADMIN' },
      { user_id: 'u2', email: 'c@d.com', code: 'ADMIN' },
    ]);
    const repo = makeRepo(chain);

    const result = await repo.listMembersByRole({ tenantId: 't1', workspaceId: 'ws1', roleId: 'r1' });
    expect(result).toEqual([
      { userId: 'u1', email: 'a@b.com', role_code: 'ADMIN' },
      { userId: 'u2', email: 'c@d.com', role_code: 'ADMIN' },
    ]);
  });
});
