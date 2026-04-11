import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AssignmentsService } from './assignments.service';
import { AccessLevel } from '../../interfaces/access-level.enum';

const T1 = '10000000-0000-0000-0000-000000000001';
const WS1 = '20000000-0000-0000-0000-000000000001';
const USER1 = '30000000-0000-0000-0000-000000000001';
const ROLE1 = '40000000-0000-0000-0000-000000000001';
const GROUP1 = '45000000-0000-0000-0000-000000000001';

const BASE_RECORD = {
  id: 'assign-1',
  tenant_id: T1,
  workspace_id: WS1,
  cell_id: null,
  target_type: 'USER' as const,
  target_id: USER1,
  scope_type: 'FEATURE' as const,
  scope_code: 'WORKSPACE_CREATE',
  access_level: AccessLevel.VIEW,
  created_at: new Date(),
};

function makeService(
  overrides: {
    config?: Partial<{
      isTargetTypeAllowed: (t: string) => boolean;
      isScopeTypeAllowed: (t: string) => boolean;
    }>;
    repository?: Partial<{
      upsertAssignment: (i: any) => Promise<typeof BASE_RECORD>;
      findByTargets: (i: any) => Promise<(typeof BASE_RECORD)[]>;
      removeAssignmentScoped: (i: any) => Promise<boolean>;
      removeAssignmentsForTarget: (i: any) => Promise<void>;
      userExists: (id: string) => Promise<boolean>;
    }>;
    registry?: Partial<{ ensureScopeExists: (t: string, c: string) => Promise<boolean> }>;
    roles?: Partial<{ existsInOrg: (w: string, r: string) => Promise<boolean> }>;
    groups?: Partial<{ existsInOrg: (w: string, g: string) => Promise<boolean> }>;
  } = {},
) {
  const config = {
    isTargetTypeAllowed: vi.fn().mockReturnValue(true),
    isScopeTypeAllowed: vi.fn().mockReturnValue(true),
    ...overrides.config,
  };
  const repository = {
    upsertAssignment: vi.fn().mockResolvedValue(BASE_RECORD),
    findByTargets: vi.fn().mockResolvedValue([BASE_RECORD]),
    findTenantDomainAssignmentsForUser: vi.fn().mockResolvedValue([]),
    listByCell: vi.fn().mockResolvedValue([]),
    removeAssignment: vi.fn().mockResolvedValue(undefined),
    removeAssignmentScoped: vi.fn().mockResolvedValue(true),
    removeAssignmentsForTarget: vi.fn().mockResolvedValue(undefined),
    userExists: vi.fn().mockResolvedValue(true),
    ...overrides.repository,
  };
  const registry = {
    ensureScopeExists: vi.fn().mockResolvedValue(true),
    ...overrides.registry,
  };
  const roles = {
    existsInOrg: vi.fn().mockResolvedValue(true),
    ...overrides.roles,
  };
  const groups = {
    existsInOrg: vi.fn().mockResolvedValue(true),
    ...overrides.groups,
  };
  const codeNormalizer = { normalizeScopeCode: (c: string) => c.toUpperCase() };

  return new (AssignmentsService as any)(
    config,
    repository,
    registry,
    roles,
    groups,
    codeNormalizer,
  ) as AssignmentsService;
}

describe('AssignmentsService.upsertAssignment', () => {
  it('throws ForbiddenException when targetType is not allowed', async () => {
    const service = makeService({ config: { isTargetTypeAllowed: vi.fn().mockReturnValue(false) } });
    await expect(
      service.upsertAssignment({
        tenantId: T1,
        workspaceId: WS1,
        targetType: 'USER',
        targetId: USER1,
        scopeType: 'FEATURE',
        scopeCode: 'X',
        accessLevel: AccessLevel.VIEW,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws ForbiddenException when scopeType is not allowed', async () => {
    const service = makeService({ config: { isScopeTypeAllowed: vi.fn().mockReturnValue(false) } });
    await expect(
      service.upsertAssignment({
        tenantId: T1,
        workspaceId: WS1,
        targetType: 'USER',
        targetId: USER1,
        scopeType: 'FEATURE',
        scopeCode: 'X',
        accessLevel: AccessLevel.VIEW,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws NotFoundException when scope code is not registered', async () => {
    const service = makeService({ registry: { ensureScopeExists: vi.fn().mockResolvedValue(false) } });
    await expect(
      service.upsertAssignment({
        tenantId: T1,
        workspaceId: WS1,
        targetType: 'USER',
        targetId: USER1,
        scopeType: 'FEATURE',
        scopeCode: 'UNKNOWN',
        accessLevel: AccessLevel.VIEW,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws NotFoundException when target USER does not exist', async () => {
    const service = makeService({ repository: { userExists: vi.fn().mockResolvedValue(false) } });
    await expect(
      service.upsertAssignment({
        tenantId: T1,
        workspaceId: WS1,
        targetType: 'USER',
        targetId: USER1,
        scopeType: 'FEATURE',
        scopeCode: 'X',
        accessLevel: AccessLevel.VIEW,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws NotFoundException when target ROLE does not exist in workspace', async () => {
    const service = makeService({ roles: { existsInOrg: vi.fn().mockResolvedValue(false) } });
    await expect(
      service.upsertAssignment({
        tenantId: T1,
        workspaceId: WS1,
        targetType: 'ROLE',
        targetId: ROLE1,
        scopeType: 'FEATURE',
        scopeCode: 'X',
        accessLevel: AccessLevel.VIEW,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws NotFoundException when target GROUP does not exist in workspace', async () => {
    const service = makeService({ groups: { existsInOrg: vi.fn().mockResolvedValue(false) } });
    await expect(
      service.upsertAssignment({
        tenantId: T1,
        workspaceId: WS1,
        targetType: 'GROUP',
        targetId: GROUP1,
        scopeType: 'FEATURE',
        scopeCode: 'X',
        accessLevel: AccessLevel.VIEW,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('succeeds with null workspaceId and cellId absent', async () => {
    const upsertAssignment = vi.fn().mockResolvedValue(BASE_RECORD);
    const service = makeService({ repository: { upsertAssignment } });

    await service.upsertAssignment({
      tenantId: T1,
      workspaceId: null,
      targetType: 'USER',
      targetId: USER1,
      scopeType: 'FEATURE',
      scopeCode: 'X',
      accessLevel: AccessLevel.VIEW,
    });

    expect(upsertAssignment).toHaveBeenCalledWith(
      expect.objectContaining({ workspaceId: null, cellId: null }),
    );
  });

  it('succeeds when target is ROLE and role exists', async () => {
    const upsertAssignment = vi.fn().mockResolvedValue(BASE_RECORD);
    const service = makeService({ repository: { upsertAssignment } });

    await service.upsertAssignment({
      tenantId: T1,
      workspaceId: WS1,
      targetType: 'ROLE',
      targetId: ROLE1,
      scopeType: 'FEATURE',
      scopeCode: 'X',
      accessLevel: AccessLevel.VIEW,
    });

    expect(upsertAssignment).toHaveBeenCalled();
  });

  it('delegates to repository.upsertAssignment on success', async () => {
    const upsertAssignment = vi.fn().mockResolvedValue(BASE_RECORD);
    const service = makeService({ repository: { upsertAssignment } });

    const result = await service.upsertAssignment({
      tenantId: T1,
      workspaceId: WS1,
      targetType: 'USER',
      targetId: USER1,
      scopeType: 'FEATURE',
      scopeCode: 'workspace_create',
      accessLevel: AccessLevel.VIEW,
    });

    expect(result).toEqual(BASE_RECORD);
    // code normalizer uppercases the scopeCode
    expect(upsertAssignment).toHaveBeenCalledWith(expect.objectContaining({ scopeCode: 'WORKSPACE_CREATE' }));
  });
});

describe('AssignmentsService.findAssignmentsForTarget', () => {
  it('delegates to repository.findByTargets and returns results', async () => {
    const findByTargets = vi.fn().mockResolvedValue([BASE_RECORD]);
    const service = makeService({ repository: { findByTargets } });

    const result = await service.findAssignmentsForTarget({
      workspaceId: WS1,
      targetType: 'ROLE',
      targetIds: [ROLE1],
      scopeTypes: ['FEATURE'],
    });

    expect(result).toEqual([BASE_RECORD]);
    expect(findByTargets).toHaveBeenCalledWith({
      workspaceId: WS1,
      targetType: 'ROLE',
      targetIds: [ROLE1],
      scopeTypes: ['FEATURE'],
    });
  });
});

describe('AssignmentsService.removeWorkspacePermission', () => {
  it('returns result from repository.removeAssignmentScoped', async () => {
    const removeAssignmentScoped = vi.fn().mockResolvedValue(true);
    const service = makeService({ repository: { removeAssignmentScoped } });

    const result = await service.removeWorkspacePermission('assign-1', 'ws1');

    expect(result).toBe(true);
    expect(removeAssignmentScoped).toHaveBeenCalledWith({ id: 'assign-1', workspaceId: 'ws1' });
  });
});

describe('AssignmentsService.listCellPermissions', () => {
  it('delegates to repository.listByCell', async () => {
    const listByCell = vi.fn().mockResolvedValue([BASE_RECORD]);
    const service = makeService({ repository: { listByCell } as any });

    const result = await service.listCellPermissions({ tenantId: T1, workspaceId: WS1, cellId: 'cell-1' });
    expect(result).toEqual([BASE_RECORD]);
  });
});

describe('AssignmentsService.removeCellPermission', () => {
  it('delegates to repository.removeAssignment', async () => {
    const removeAssignment = vi.fn().mockResolvedValue(undefined);
    const service = makeService({ repository: { removeAssignment } as any });

    await service.removeCellPermission('assign-1');
    expect(removeAssignment).toHaveBeenCalledWith('assign-1');
  });
});

describe('AssignmentsService.removeAssignmentsForTarget', () => {
  it('delegates to repository.removeAssignmentsForTarget', async () => {
    const removeAssignmentsForTarget = vi.fn().mockResolvedValue(undefined);
    const service = makeService({ repository: { removeAssignmentsForTarget } as any });

    await service.removeAssignmentsForTarget({ targetType: 'ROLE', targetId: ROLE1 });
    expect(removeAssignmentsForTarget).toHaveBeenCalledWith({ targetType: 'ROLE', targetId: ROLE1 });
  });
});

describe('AssignmentsService.findTenantDomainAssignmentsForUser', () => {
  it('delegates to repository', async () => {
    const findTenantDomainAssignmentsForUser = vi.fn().mockResolvedValue([]);
    const service = makeService({ repository: { findTenantDomainAssignmentsForUser } as any });

    await service.findTenantDomainAssignmentsForUser({ tenantId: T1, userId: USER1 });
    expect(findTenantDomainAssignmentsForUser).toHaveBeenCalledWith({ tenantId: T1, userId: USER1 });
  });
});
