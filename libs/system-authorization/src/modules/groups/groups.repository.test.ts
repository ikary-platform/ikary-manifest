import { describe, expect, it, vi } from 'vitest';
import { GroupsRepository } from './groups.repository';

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
  return new GroupsRepository({ db: chain } as any);
}

const GROUP_ROW = {
  id: 'group-1',
  tenant_id: 't1',
  workspace_id: 'ws1',
  code: 'ENGINEERING',
  name: 'Engineering',
  description: null,
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
};

describe('GroupsRepository.upsertGroup — insert path', () => {
  it('inserts when no existing group with same workspace+code', async () => {
    const chain = makeChain([]);
    chain.executeTakeFirst = vi.fn().mockResolvedValueOnce(undefined);
    chain.executeTakeFirstOrThrow = vi.fn().mockResolvedValue(GROUP_ROW);
    const repo = makeRepo(chain);

    const result = await repo.upsertGroup({
      tenantId: 't1',
      workspaceId: 'ws1',
      code: 'ENGINEERING',
      name: 'Engineering',
    });

    expect(result).toEqual(GROUP_ROW);
    expect(chain.executeTakeFirstOrThrow).toHaveBeenCalled();
  });

  it('sets description to null when not provided', async () => {
    const chain = makeChain([]);
    chain.executeTakeFirst = vi.fn().mockResolvedValueOnce(undefined);
    chain.executeTakeFirstOrThrow = vi.fn().mockResolvedValue(GROUP_ROW);
    const repo = makeRepo(chain);

    const result = await repo.upsertGroup({
      tenantId: 't1',
      workspaceId: 'ws1',
      code: 'ENGINEERING',
      name: 'Engineering',
    });

    expect(result).toEqual(GROUP_ROW);
  });
});

describe('GroupsRepository.upsertGroup — update path', () => {
  it('updates when an existing group with same workspace+code is found', async () => {
    const existing = { id: 'group-1' };
    const updated = { ...GROUP_ROW, name: 'Updated Name' };
    const chain = makeChain([]);
    chain.executeTakeFirst = vi.fn().mockResolvedValueOnce(existing);
    chain.executeTakeFirstOrThrow = vi.fn().mockResolvedValue(updated);
    const repo = makeRepo(chain);

    const result = await repo.upsertGroup({
      tenantId: 't1',
      workspaceId: 'ws1',
      code: 'ENGINEERING',
      name: 'Updated Name',
    });

    expect(result.name).toBe('Updated Name');
  });

  it('passes description through on update', async () => {
    const existing = { id: 'group-1' };
    const updated = { ...GROUP_ROW, description: 'New description' };
    const chain = makeChain([]);
    chain.executeTakeFirst = vi.fn().mockResolvedValueOnce(existing);
    chain.executeTakeFirstOrThrow = vi.fn().mockResolvedValue(updated);
    const repo = makeRepo(chain);

    const result = await repo.upsertGroup({
      tenantId: 't1',
      workspaceId: 'ws1',
      code: 'ENGINEERING',
      name: 'Engineering',
      description: 'New description',
    });

    expect(result.description).toBe('New description');
  });
});

describe('GroupsRepository.assignUserGroup', () => {
  it('inserts a user_groups record with onConflict doNothing', async () => {
    const chain = makeChain([]);
    const repo = makeRepo(chain);

    await repo.assignUserGroup({
      tenantId: 't1',
      workspaceId: 'ws1',
      userId: 'user-1',
      groupId: 'group-1',
    });

    expect(chain.execute).toHaveBeenCalled();
  });
});

describe('GroupsRepository.getGroupIdsForUser', () => {
  it('returns group IDs from joined query', async () => {
    const rows = [{ group_id: 'g1' }, { group_id: 'g2' }];
    const chain = makeChain(rows);
    const repo = makeRepo(chain);

    const result = await repo.getGroupIdsForUser('ws1', 'user-1');

    expect(result).toEqual(['g1', 'g2']);
    expect(chain.execute).toHaveBeenCalled();
  });

  it('returns empty array when user has no groups', async () => {
    const chain = makeChain([]);
    const repo = makeRepo(chain);

    const result = await repo.getGroupIdsForUser('ws1', 'user-1');

    expect(result).toEqual([]);
  });
});

describe('GroupsRepository.existsInOrg', () => {
  it('returns true when a group with matching workspaceId and groupId is found', async () => {
    const chain = makeChain([]);
    chain.executeTakeFirst = vi.fn().mockResolvedValue({ id: 'group-1' });
    const repo = makeRepo(chain);

    expect(await repo.existsInOrg('ws1', 'group-1')).toBe(true);
  });

  it('returns false when no matching group is found', async () => {
    const chain = makeChain([]);
    chain.executeTakeFirst = vi.fn().mockResolvedValue(undefined);
    const repo = makeRepo(chain);

    expect(await repo.existsInOrg('ws1', 'group-ghost')).toBe(false);
  });
});
