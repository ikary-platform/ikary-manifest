import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { GroupsService } from './groups.service';

const T1 = '10000000-0000-0000-0000-000000000001';
const WS1 = '20000000-0000-0000-0000-000000000001';
const USER1 = '30000000-0000-0000-0000-000000000001';
const GROUP1 = '60000000-0000-0000-0000-000000000001';

const GROUP_RECORD = {
  id: GROUP1,
  tenant_id: T1,
  workspace_id: WS1,
  code: 'ENGINEERING',
  name: 'Engineering',
  description: null,
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
};

function makeService(
  overrides: {
    config?: Record<string, any>;
    repository?: Record<string, any>;
    codeNormalizer?: Record<string, any>;
  } = {},
) {
  const config = {
    includesGroupAssignments: vi.fn().mockReturnValue(true),
    ...overrides.config,
  };

  const repository = {
    upsertGroup: vi.fn().mockResolvedValue(GROUP_RECORD),
    assignUserGroup: vi.fn().mockResolvedValue(undefined),
    getGroupIdsForUser: vi.fn().mockResolvedValue([GROUP1]),
    existsInOrg: vi.fn().mockResolvedValue(true),
    ...overrides.repository,
  };

  const codeNormalizer = {
    normalizeScopeCode: vi.fn((c: string) => c.toUpperCase()),
    ...overrides.codeNormalizer,
  };

  return {
    service: new (GroupsService as any)(config, repository, codeNormalizer) as GroupsService,
    mocks: { config, repository, codeNormalizer },
  };
}

describe('GroupsService.createGroup', () => {
  it('throws ForbiddenException when group assignments are disabled', async () => {
    const { service } = makeService({ config: { includesGroupAssignments: vi.fn().mockReturnValue(false) } });
    await expect(
      service.createGroup({ tenantId: T1, workspaceId: WS1, code: 'eng', name: 'Engineering' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('normalizes code and delegates to repository.upsertGroup', async () => {
    const { service, mocks } = makeService();
    const result = await service.createGroup({ tenantId: T1, workspaceId: WS1, code: 'eng', name: 'Engineering' });
    expect(mocks.codeNormalizer.normalizeScopeCode).toHaveBeenCalledWith('eng');
    expect(mocks.repository.upsertGroup).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'ENG', name: 'Engineering' }),
    );
    expect(result).toEqual(GROUP_RECORD);
  });

  it('passes description through when provided', async () => {
    const { service, mocks } = makeService();
    await service.createGroup({
      tenantId: T1,
      workspaceId: WS1,
      code: 'eng',
      name: 'Engineering',
      description: 'The engineering team',
    });
    expect(mocks.repository.upsertGroup).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'The engineering team' }),
    );
  });
});

describe('GroupsService.assignUserGroup', () => {
  it('throws ForbiddenException when group assignments are disabled', async () => {
    const { service } = makeService({ config: { includesGroupAssignments: vi.fn().mockReturnValue(false) } });
    await expect(
      service.assignUserGroup({ tenantId: T1, workspaceId: WS1, userId: USER1, groupId: GROUP1 }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('delegates to repository.assignUserGroup', async () => {
    const { service, mocks } = makeService();
    await service.assignUserGroup({ tenantId: T1, workspaceId: WS1, userId: USER1, groupId: GROUP1 });
    expect(mocks.repository.assignUserGroup).toHaveBeenCalledWith({
      tenantId: T1,
      workspaceId: WS1,
      userId: USER1,
      groupId: GROUP1,
    });
  });
});

describe('GroupsService.getGroupIdsForUser', () => {
  it('delegates to repository.getGroupIdsForUser', async () => {
    const { service, mocks } = makeService();
    const result = await service.getGroupIdsForUser(WS1, USER1);
    expect(mocks.repository.getGroupIdsForUser).toHaveBeenCalledWith(WS1, USER1);
    expect(result).toEqual([GROUP1]);
  });
});

describe('GroupsService.existsInOrg', () => {
  it('delegates to repository.existsInOrg and returns true', async () => {
    const { service, mocks } = makeService();
    const result = await service.existsInOrg(WS1, GROUP1);
    expect(mocks.repository.existsInOrg).toHaveBeenCalledWith(WS1, GROUP1);
    expect(result).toBe(true);
  });

  it('returns false when repository returns false', async () => {
    const { service } = makeService({ repository: { existsInOrg: vi.fn().mockResolvedValue(false) } });
    const result = await service.existsInOrg(WS1, GROUP1);
    expect(result).toBe(false);
  });
});
