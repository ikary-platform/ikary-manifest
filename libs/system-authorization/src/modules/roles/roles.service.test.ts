import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { RolesService } from './roles.service';

const T1 = '10000000-0000-0000-0000-000000000001';
const WS1 = '20000000-0000-0000-0000-000000000001';
const USER1 = '30000000-0000-0000-0000-000000000001';
const ROLE1 = '40000000-0000-0000-0000-000000000001';

const ROLE_RECORD = {
  id: ROLE1,
  tenant_id: T1,
  workspace_id: WS1,
  code: 'CUSTOM_ROLE',
  name: 'Custom Role',
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
    includesRoleAssignments: vi.fn().mockReturnValue(true),
    ...overrides.config,
  };

  const repository = {
    upsertRole: vi.fn().mockResolvedValue(ROLE_RECORD),
    assignUserRole: vi.fn().mockResolvedValue(undefined),
    unassignUserRole: vi.fn().mockResolvedValue(undefined),
    softDeleteRole: vi.fn().mockResolvedValue(true),
    findByCode: vi.fn().mockResolvedValue(ROLE_RECORD),
    listByWorkspace: vi.fn().mockResolvedValue([ROLE_RECORD]),
    getRoleIdsForUser: vi.fn().mockResolvedValue([ROLE1]),
    existsInOrg: vi.fn().mockResolvedValue(true),
    countActiveOwners: vi.fn().mockResolvedValue(3),
    listMembersByRole: vi.fn().mockResolvedValue([]),
    ...overrides.repository,
  };

  const codeNormalizer = {
    normalizeScopeCode: vi.fn((c: string) => c.toUpperCase()),
    ...overrides.codeNormalizer,
  };

  return {
    service: new (RolesService as any)(config, repository, codeNormalizer) as RolesService,
    mocks: { config, repository, codeNormalizer },
  };
}

describe('RolesService.createRole', () => {
  it('throws ForbiddenException when role assignments are disabled', async () => {
    const { service } = makeService({ config: { includesRoleAssignments: vi.fn().mockReturnValue(false) } });
    await expect(
      service.createRole({ tenantId: T1, workspaceId: WS1, code: 'ADMIN', name: 'Admin' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('normalizes code and delegates to repository.upsertRole', async () => {
    const { service, mocks } = makeService();
    const result = await service.createRole({ tenantId: T1, workspaceId: WS1, code: 'admin', name: 'Admin' });
    expect(mocks.codeNormalizer.normalizeScopeCode).toHaveBeenCalledWith('admin');
    expect(mocks.repository.upsertRole).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'ADMIN', name: 'Admin' }),
    );
    expect(result).toEqual(ROLE_RECORD);
  });

  it('passes description through when provided', async () => {
    const { service, mocks } = makeService();
    await service.createRole({ tenantId: T1, workspaceId: WS1, code: 'admin', name: 'Admin', description: 'desc' });
    expect(mocks.repository.upsertRole).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'desc' }),
    );
  });
});

describe('RolesService.assignUserRole', () => {
  it('throws ForbiddenException when role assignments are disabled', async () => {
    const { service } = makeService({ config: { includesRoleAssignments: vi.fn().mockReturnValue(false) } });
    await expect(
      service.assignUserRole({ tenantId: T1, workspaceId: WS1, userId: USER1, roleId: ROLE1 }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('delegates to repository.assignUserRole', async () => {
    const { service, mocks } = makeService();
    await service.assignUserRole({ tenantId: T1, workspaceId: WS1, userId: USER1, roleId: ROLE1 });
    expect(mocks.repository.assignUserRole).toHaveBeenCalledWith({
      tenantId: T1,
      workspaceId: WS1,
      userId: USER1,
      roleId: ROLE1,
    });
  });

  it('sets workspaceId to null when not provided', async () => {
    const { service, mocks } = makeService();
    await service.assignUserRole({ tenantId: T1, userId: USER1, roleId: ROLE1 });
    expect(mocks.repository.assignUserRole).toHaveBeenCalledWith(
      expect.objectContaining({ workspaceId: null }),
    );
  });
});

describe('RolesService.unassignUserRole', () => {
  it('throws ForbiddenException when role assignments are disabled', async () => {
    const { service } = makeService({ config: { includesRoleAssignments: vi.fn().mockReturnValue(false) } });
    await expect(
      service.unassignUserRole({ tenantId: T1, workspaceId: WS1, userId: USER1, roleId: ROLE1 }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('delegates to repository.unassignUserRole', async () => {
    const { service, mocks } = makeService();
    await service.unassignUserRole({ tenantId: T1, workspaceId: WS1, userId: USER1, roleId: ROLE1 });
    expect(mocks.repository.unassignUserRole).toHaveBeenCalledWith({
      tenantId: T1,
      workspaceId: WS1,
      userId: USER1,
      roleId: ROLE1,
    });
  });

  it('sets workspaceId to null when not provided', async () => {
    const { service, mocks } = makeService();
    await service.unassignUserRole({ tenantId: T1, userId: USER1, roleId: ROLE1 });
    expect(mocks.repository.unassignUserRole).toHaveBeenCalledWith(
      expect.objectContaining({ workspaceId: null }),
    );
  });
});

describe('RolesService.deleteRole', () => {
  it('throws ForbiddenException when role assignments are disabled', async () => {
    const { service } = makeService({ config: { includesRoleAssignments: vi.fn().mockReturnValue(false) } });
    await expect(
      service.deleteRole({ tenantId: T1, workspaceId: WS1, roleId: ROLE1 }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('delegates to repository.softDeleteRole and returns result', async () => {
    const { service, mocks } = makeService();
    const result = await service.deleteRole({ tenantId: T1, workspaceId: WS1, roleId: ROLE1 });
    expect(result).toBe(true);
    expect(mocks.repository.softDeleteRole).toHaveBeenCalledWith({
      tenantId: T1,
      workspaceId: WS1,
      roleId: ROLE1,
    });
  });

  it('returns false when repository returns false', async () => {
    const { service } = makeService({ repository: { softDeleteRole: vi.fn().mockResolvedValue(false) } });
    const result = await service.deleteRole({ tenantId: T1, workspaceId: WS1, roleId: ROLE1 });
    expect(result).toBe(false);
  });
});

describe('RolesService.findRoleByCode', () => {
  it('normalizes code and delegates to repository.findByCode', async () => {
    const { service, mocks } = makeService();
    const result = await service.findRoleByCode(T1, WS1, 'admin');
    expect(mocks.codeNormalizer.normalizeScopeCode).toHaveBeenCalledWith('admin');
    expect(mocks.repository.findByCode).toHaveBeenCalledWith(T1, WS1, 'ADMIN');
    expect(result).toEqual(ROLE_RECORD);
  });
});

describe('RolesService.listByWorkspace', () => {
  it('delegates to repository.listByWorkspace', async () => {
    const { service, mocks } = makeService();
    const result = await service.listByWorkspace(T1, WS1);
    expect(mocks.repository.listByWorkspace).toHaveBeenCalledWith(T1, WS1);
    expect(result).toEqual([ROLE_RECORD]);
  });
});

describe('RolesService.getRoleIdsForUser', () => {
  it('delegates to repository.getRoleIdsForUser', async () => {
    const { service, mocks } = makeService();
    const result = await service.getRoleIdsForUser(WS1, USER1);
    expect(mocks.repository.getRoleIdsForUser).toHaveBeenCalledWith(WS1, USER1);
    expect(result).toEqual([ROLE1]);
  });
});

describe('RolesService.existsInOrg', () => {
  it('delegates to repository.existsInOrg', async () => {
    const { service, mocks } = makeService();
    const result = await service.existsInOrg(WS1, ROLE1);
    expect(mocks.repository.existsInOrg).toHaveBeenCalledWith(WS1, ROLE1);
    expect(result).toBe(true);
  });
});

describe('RolesService.countActiveOwners', () => {
  it('delegates to repository.countActiveOwners', async () => {
    const { service, mocks } = makeService();
    const result = await service.countActiveOwners(T1, WS1);
    expect(mocks.repository.countActiveOwners).toHaveBeenCalledWith(T1, WS1);
    expect(result).toBe(3);
  });
});

describe('RolesService.getRoleMembers', () => {
  it('delegates to repository.listMembersByRole', async () => {
    const { service, mocks } = makeService();
    await service.getRoleMembers({ tenantId: T1, workspaceId: WS1, roleId: ROLE1 });
    expect(mocks.repository.listMembersByRole).toHaveBeenCalledWith({
      tenantId: T1,
      workspaceId: WS1,
      roleId: ROLE1,
    });
  });
});
