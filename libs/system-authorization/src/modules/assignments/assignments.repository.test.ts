import { describe, expect, it, vi } from 'vitest';
import { AssignmentsRepository } from './assignments.repository';

function makeChain(rows: any[] = []) {
  const chain: any = {
    selectFrom: () => chain,
    select: () => chain,
    selectAll: () => chain,
    where: () => chain,
    orderBy: () => chain,
    limit: () => chain,
    offset: () => chain,
    insertInto: () => chain,
    values: () => chain,
    updateTable: () => chain,
    set: () => chain,
    deleteFrom: () => chain,
    returning: () => chain,
    returningAll: () => chain,
    onConflict: () => chain,
    doUpdateSet: () => chain,
    execute: vi.fn().mockResolvedValue(rows),
    executeTakeFirst: vi.fn().mockResolvedValue(rows[0]),
    executeTakeFirstOrThrow: vi.fn().mockResolvedValue(rows[0]),
  };
  return chain;
}

function makeRepo(chain: ReturnType<typeof makeChain>) {
  const db = { db: chain } as any;
  return new AssignmentsRepository(db);
}

const BASE = {
  id: 'assign-1',
  tenant_id: 't1',
  workspace_id: 'ws1',
  cell_id: null,
  target_type: 'USER' as const,
  target_id: 'user-1',
  scope_type: 'FEATURE' as const,
  scope_code: 'WORKSPACE_CREATE',
  access_level: 3,
  created_at: new Date(),
};

describe('AssignmentsRepository.upsertAssignment — insert path', () => {
  it('inserts a new record when no existing match is found', async () => {
    const chain = makeChain([]);
    chain.executeTakeFirst = vi.fn().mockResolvedValueOnce(undefined).mockResolvedValue(BASE);
    chain.executeTakeFirstOrThrow = vi.fn().mockResolvedValue(BASE);
    const repo = makeRepo(chain);

    const result = await repo.upsertAssignment({
      tenantId: 't1',
      workspaceId: 'ws1',
      targetType: 'USER',
      targetId: 'user-1',
      scopeType: 'FEATURE',
      scopeCode: 'WORKSPACE_CREATE',
      accessLevel: 3,
    });

    expect(result).toEqual(BASE);
    expect(chain.executeTakeFirstOrThrow).toHaveBeenCalled();
  });
});

describe('AssignmentsRepository.upsertAssignment — update path', () => {
  it('updates access_level when a matching record exists', async () => {
    const existing = { id: 'assign-1' };
    const updated = { ...BASE, access_level: 5 };
    const chain = makeChain([]);
    chain.executeTakeFirst = vi.fn().mockResolvedValueOnce(existing);
    chain.executeTakeFirstOrThrow = vi.fn().mockResolvedValue(updated);
    const repo = makeRepo(chain);

    const result = await repo.upsertAssignment({
      tenantId: 't1',
      workspaceId: 'ws1',
      targetType: 'USER',
      targetId: 'user-1',
      scopeType: 'FEATURE',
      scopeCode: 'WORKSPACE_CREATE',
      accessLevel: 5,
    });

    expect(result.access_level).toBe(5);
  });
});

describe('AssignmentsRepository.findByTargets', () => {
  it('returns empty array when targetIds is empty', async () => {
    const chain = makeChain([]);
    const repo = makeRepo(chain);

    const result = await repo.findByTargets({
      workspaceId: 'ws1',
      targetType: 'USER',
      targetIds: [],
      scopeTypes: ['FEATURE'],
    });

    expect(result).toEqual([]);
    expect(chain.execute).not.toHaveBeenCalled();
  });

  it('returns empty array when scopeTypes is empty', async () => {
    const chain = makeChain([]);
    const repo = makeRepo(chain);

    const result = await repo.findByTargets({
      workspaceId: 'ws1',
      targetType: 'USER',
      targetIds: ['user-1'],
      scopeTypes: [],
    });

    expect(result).toEqual([]);
  });

  it('returns rows from DB when valid inputs provided', async () => {
    const rows = [BASE];
    const chain = makeChain(rows);
    const repo = makeRepo(chain);

    const result = await repo.findByTargets({
      workspaceId: 'ws1',
      targetType: 'USER',
      targetIds: ['user-1'],
      scopeTypes: ['FEATURE'],
    });

    expect(result).toEqual(rows);
  });
});

describe('AssignmentsRepository.removeAssignmentScoped', () => {
  it('returns true when a row was deleted (workspaceId matches)', async () => {
    const chain = makeChain([]);
    chain.executeTakeFirst = vi.fn().mockResolvedValue({ numDeletedRows: 1n });
    const repo = makeRepo(chain);

    const result = await repo.removeAssignmentScoped({ id: 'assign-1', workspaceId: 'ws1' });

    expect(result).toBe(true);
  });

  it('returns false when no row was deleted (workspaceId mismatch)', async () => {
    const chain = makeChain([]);
    chain.executeTakeFirst = vi.fn().mockResolvedValue({ numDeletedRows: 0n });
    const repo = makeRepo(chain);

    const result = await repo.removeAssignmentScoped({ id: 'assign-1', workspaceId: 'ws-other' });

    expect(result).toBe(false);
  });
});

describe('AssignmentsRepository.userExists', () => {
  it('returns true when a user row is found', async () => {
    const chain = makeChain([]);
    chain.executeTakeFirst = vi.fn().mockResolvedValue({ id: 'user-1' });
    const repo = makeRepo(chain);

    expect(await repo.userExists('user-1')).toBe(true);
  });

  it('returns false when no user row is found', async () => {
    const chain = makeChain([]);
    chain.executeTakeFirst = vi.fn().mockResolvedValue(undefined);
    const repo = makeRepo(chain);

    expect(await repo.userExists('unknown')).toBe(false);
  });
});

describe('AssignmentsRepository.listByCell', () => {
  it('returns all assignments for the given cell', async () => {
    const rows = [BASE, { ...BASE, id: 'assign-2' }];
    const chain = makeChain(rows);
    const repo = makeRepo(chain);

    const result = await repo.listByCell({ tenantId: 't1', workspaceId: 'ws1', cellId: 'cell-1' });

    expect(result).toHaveLength(2);
  });
});

describe('AssignmentsRepository.findByTargets — with cellId', () => {
  it('includes cellId filter when provided', async () => {
    const rows = [BASE];
    const chain = makeChain(rows);
    const repo = makeRepo(chain);

    const result = await repo.findByTargets({
      workspaceId: 'ws1',
      cellId: 'cell-1',
      targetType: 'USER',
      targetIds: ['user-1'],
      scopeTypes: ['FEATURE'],
    });

    expect(result).toEqual(rows);
  });
});

describe('AssignmentsRepository.findTenantDomainAssignmentsForUser', () => {
  it('returns domain assignments for user at tenant level', async () => {
    const rows = [{ ...BASE, scope_type: 'DOMAIN' as const, workspace_id: null }];
    const chain = makeChain(rows);
    const repo = makeRepo(chain);

    const result = await repo.findTenantDomainAssignmentsForUser({ tenantId: 't1', userId: 'user-1' });
    expect(result).toEqual(rows);
  });
});

describe('AssignmentsRepository.removeAssignment', () => {
  it('deletes the assignment by id', async () => {
    const chain = makeChain([]);
    const repo = makeRepo(chain);

    await repo.removeAssignment('assign-1');
    expect(chain.execute).toHaveBeenCalled();
  });
});

describe('AssignmentsRepository.removeAssignmentsForTarget', () => {
  it('deletes all assignments for the given target', async () => {
    const chain = makeChain([]);
    const repo = makeRepo(chain);

    await repo.removeAssignmentsForTarget({ targetType: 'ROLE', targetId: 'role-1' });
    expect(chain.execute).toHaveBeenCalled();
  });
});
