import { UnprocessableEntityException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AccessLevel } from '../interfaces/access-level.enum';
import type { ResolvedPermissions } from '../interfaces/authorization.types';
import { AuthorizationService } from './authorization.service';

const T1 = '10000000-0000-0000-0000-000000000001';
const WS1 = '20000000-0000-0000-0000-000000000001';
const USER1 = '30000000-0000-0000-0000-000000000001';
const ROLE1 = '40000000-0000-0000-0000-000000000001';
const CELL1 = '50000000-0000-0000-0000-000000000001';
const GROUP1 = '60000000-0000-0000-0000-000000000001';

const RESOLVED: ResolvedPermissions = {
  featureScopes: { WORKSPACE_CREATE: AccessLevel.EDIT },
  domainScopes: { BILLING: AccessLevel.VIEW },
};

function makeService(
  overrides: {
    resolver?: Record<string, any>;
    registry?: Record<string, any>;
    permissionNamespaceRegistry?: Record<string, any>;
    assignments?: Record<string, any>;
    roles?: Record<string, any>;
    groups?: Record<string, any>;
    codeNormalizer?: Record<string, any>;
  } = {},
) {
  const resolver = {
    resolvePermissions: vi.fn().mockResolvedValue(RESOLVED),
    resolveTenantDomainPermissions: vi.fn().mockResolvedValue({ BILLING: AccessLevel.EDIT }),
    ...overrides.resolver,
  };

  const registry = {
    registerFeature: vi.fn().mockResolvedValue(undefined),
    registerDomain: vi.fn().mockResolvedValue(undefined),
    setupAuthorization: vi.fn().mockResolvedValue(undefined),
    listFeatures: vi.fn().mockResolvedValue([]),
    listDomains: vi.fn().mockResolvedValue([]),
    ...overrides.registry,
  };

  const permissionNamespaceRegistry = {
    registerPermissions: vi.fn().mockResolvedValue(undefined),
    ...overrides.permissionNamespaceRegistry,
  };

  const assignments = {
    upsertAssignment: vi.fn().mockResolvedValue({ id: 'a1' }),
    listCellPermissions: vi.fn().mockResolvedValue([]),
    findAssignmentsForTarget: vi.fn().mockResolvedValue([]),
    removeCellPermission: vi.fn().mockResolvedValue(undefined),
    removeWorkspacePermission: vi.fn().mockResolvedValue(true),
    removeAssignmentsForTarget: vi.fn().mockResolvedValue(undefined),
    ...overrides.assignments,
  };

  const roles = {
    createRole: vi.fn().mockResolvedValue({ id: ROLE1 }),
    deleteRole: vi.fn().mockResolvedValue(true),
    assignUserRole: vi.fn().mockResolvedValue(undefined),
    unassignUserRole: vi.fn().mockResolvedValue(undefined),
    findRoleByCode: vi.fn().mockResolvedValue(undefined),
    listByWorkspace: vi.fn().mockResolvedValue([]),
    countActiveOwners: vi.fn().mockResolvedValue(3),
    getRoleMembers: vi.fn().mockResolvedValue([]),
    ...overrides.roles,
  };

  const groups = {
    createGroup: vi.fn().mockResolvedValue({ id: GROUP1 }),
    assignUserGroup: vi.fn().mockResolvedValue(undefined),
    ...overrides.groups,
  };

  const codeNormalizer = {
    normalizeScopeCode: vi.fn((c: string) => c.toUpperCase()),
    ...overrides.codeNormalizer,
  };

  return {
    service: new (AuthorizationService as any)(
      resolver,
      registry,
      permissionNamespaceRegistry,
      assignments,
      roles,
      groups,
      codeNormalizer,
    ) as AuthorizationService,
    mocks: { resolver, registry, permissionNamespaceRegistry, assignments, roles, groups, codeNormalizer },
  };
}

describe('AuthorizationService.resolvePermissions', () => {
  it('delegates to resolver.resolvePermissions', async () => {
    const { service, mocks } = makeService();
    const result = await service.resolvePermissions(USER1, WS1, CELL1);
    expect(mocks.resolver.resolvePermissions).toHaveBeenCalledWith(USER1, WS1, CELL1);
    expect(result).toEqual(RESOLVED);
  });
});

describe('AuthorizationService.getJwtScopes', () => {
  it('converts AccessLevel enum values to numbers', async () => {
    const { service } = makeService();
    const result = await service.getJwtScopes(USER1, WS1);
    expect(result).toEqual({
      featureScopes: { WORKSPACE_CREATE: 2 },
      domainScopes: { BILLING: 1 },
    });
  });
});

describe('AuthorizationService.canFeature', () => {
  it('returns true immediately when principal is system admin', async () => {
    const { service, mocks } = makeService();
    const result = await service.canFeature(
      { userId: USER1, workspaceId: WS1, isSystemAdmin: true },
      'WORKSPACE_CREATE',
      AccessLevel.ADMIN,
    );
    expect(result).toBe(true);
    expect(mocks.resolver.resolvePermissions).not.toHaveBeenCalled();
  });

  it('returns true when resolved scope meets required level', async () => {
    const { service } = makeService();
    const result = await service.canFeature(
      { userId: USER1, workspaceId: WS1, featureScopes: { WORKSPACE_CREATE: 3 }, domainScopes: {} },
      'workspace_create',
      AccessLevel.EDIT,
    );
    expect(result).toBe(true);
  });

  it('returns false when resolved scope is below required level', async () => {
    const { service } = makeService();
    const result = await service.canFeature(
      { userId: USER1, workspaceId: WS1, featureScopes: { WORKSPACE_CREATE: 1 }, domainScopes: {} },
      'workspace_create',
      AccessLevel.EDIT,
    );
    expect(result).toBe(false);
  });

  it('returns false when scope code is not present (defaults to NONE)', async () => {
    const { service } = makeService();
    const result = await service.canFeature(
      { userId: USER1, workspaceId: WS1, featureScopes: {}, domainScopes: {} },
      'UNKNOWN_FEATURE',
      AccessLevel.VIEW,
    );
    expect(result).toBe(false);
  });

  it('defaults required to VIEW when not provided', async () => {
    const { service } = makeService();
    const result = await service.canFeature(
      { userId: USER1, workspaceId: WS1, featureScopes: { SOME_FEATURE: AccessLevel.VIEW }, domainScopes: {} },
      'some_feature',
    );
    expect(result).toBe(true);
  });

  it('resolves fresh scopes when principal has no pre-resolved scopes', async () => {
    const { service, mocks } = makeService();
    const result = await service.canFeature(
      { userId: USER1, workspaceId: WS1 },
      'workspace_create',
      AccessLevel.VIEW,
    );
    expect(mocks.resolver.resolvePermissions).toHaveBeenCalledWith(USER1, WS1, undefined);
    expect(result).toBe(true);
  });
});

describe('AuthorizationService.canDomain', () => {
  it('returns true immediately when principal is system admin', async () => {
    const { service, mocks } = makeService();
    const result = await service.canDomain(
      { userId: USER1, workspaceId: WS1, isSystemAdmin: true },
      'BILLING',
      AccessLevel.ADMIN,
    );
    expect(result).toBe(true);
    expect(mocks.resolver.resolvePermissions).not.toHaveBeenCalled();
  });

  it('returns true when resolved scope meets required level', async () => {
    const { service } = makeService();
    const result = await service.canDomain(
      { userId: USER1, workspaceId: WS1, domainScopes: { BILLING: 2 }, featureScopes: {} },
      'billing',
      AccessLevel.EDIT,
    );
    expect(result).toBe(true);
  });

  it('returns false when resolved scope is below required level', async () => {
    const { service } = makeService();
    const result = await service.canDomain(
      { userId: USER1, workspaceId: WS1, domainScopes: { BILLING: 1 }, featureScopes: {} },
      'billing',
      AccessLevel.EDIT,
    );
    expect(result).toBe(false);
  });

  it('returns false when scope code is not present (defaults to NONE)', async () => {
    const { service } = makeService();
    const result = await service.canDomain(
      { userId: USER1, workspaceId: WS1, domainScopes: {}, featureScopes: {} },
      'UNKNOWN_DOMAIN',
    );
    expect(result).toBe(false);
  });

  it('resolves fresh scopes when principal has no pre-resolved scopes', async () => {
    const { service, mocks } = makeService();
    const result = await service.canDomain({ userId: USER1, workspaceId: WS1 }, 'billing', AccessLevel.VIEW);
    expect(mocks.resolver.resolvePermissions).toHaveBeenCalledWith(USER1, WS1, undefined);
    expect(result).toBe(true);
  });
});

describe('AuthorizationService.canDomainInTenant', () => {
  it('returns false when tenantId is not provided', async () => {
    const { service } = makeService();
    const result = await service.canDomainInTenant(
      { userId: USER1, tenantId: undefined, isSystemAdmin: false },
      'BILLING',
    );
    expect(result).toBe(false);
  });

  it('returns true when principal is system admin', async () => {
    const { service } = makeService();
    const result = await service.canDomainInTenant(
      { userId: USER1, tenantId: T1, isSystemAdmin: true },
      'BILLING',
      AccessLevel.ADMIN,
    );
    expect(result).toBe(true);
  });

  it('uses existing domainScopes when provided on principal', async () => {
    const { service, mocks } = makeService();
    const result = await service.canDomainInTenant(
      { userId: USER1, tenantId: T1, domainScopes: { BILLING: 3 } },
      'billing',
      AccessLevel.ALL,
    );
    expect(result).toBe(true);
    expect(mocks.resolver.resolveTenantDomainPermissions).not.toHaveBeenCalled();
  });

  it('resolves tenant domain scopes when domainScopes is not provided', async () => {
    const { service, mocks } = makeService();
    const result = await service.canDomainInTenant(
      { userId: USER1, tenantId: T1 },
      'billing',
      AccessLevel.VIEW,
    );
    expect(mocks.resolver.resolveTenantDomainPermissions).toHaveBeenCalledWith(USER1, T1);
    expect(result).toBe(true);
  });

  it('returns false when scope is below required level', async () => {
    const { service } = makeService();
    const result = await service.canDomainInTenant(
      { userId: USER1, tenantId: T1, domainScopes: { BILLING: 1 } },
      'billing',
      AccessLevel.ADMIN,
    );
    expect(result).toBe(false);
  });

  it('returns false when scope is not present (defaults to NONE)', async () => {
    const { service } = makeService();
    const result = await service.canDomainInTenant(
      { userId: USER1, tenantId: T1, domainScopes: {} },
      'UNKNOWN',
      AccessLevel.VIEW,
    );
    expect(result).toBe(false);
  });
});

describe('AuthorizationService.registerFeature / registerDomain / setupAuthorization', () => {
  it('delegates registerFeature to registry', async () => {
    const { service, mocks } = makeService();
    await service.registerFeature('MY_FEATURE', 'desc');
    expect(mocks.registry.registerFeature).toHaveBeenCalledWith('MY_FEATURE', 'desc');
  });

  it('delegates registerDomain to registry', async () => {
    const { service, mocks } = makeService();
    await service.registerDomain('MY_DOMAIN', 'desc');
    expect(mocks.registry.registerDomain).toHaveBeenCalledWith('MY_DOMAIN', 'desc');
  });

  it('delegates setupAuthorization to registry', async () => {
    const { service, mocks } = makeService();
    await service.setupAuthorization({ features: ['F1'], domains: ['D1'] });
    expect(mocks.registry.setupAuthorization).toHaveBeenCalledWith({ features: ['F1'], domains: ['D1'] });
  });
});

describe('AuthorizationService.registerNamespacedPermissions', () => {
  it('delegates to permissionNamespaceRegistry', async () => {
    const { service, mocks } = makeService();
    const perms = [{ code: 'NS.RES.ACT', description: 'desc' }];
    await service.registerNamespacedPermissions(perms);
    expect(mocks.permissionNamespaceRegistry.registerPermissions).toHaveBeenCalledWith(perms);
  });
});

describe('AuthorizationService.assignPermission / listCellPermissions / listRolePermissions / removeCellPermission / removeWorkspacePermission', () => {
  it('delegates assignPermission to assignments', async () => {
    const { service, mocks } = makeService();
    const input = {
      tenantId: T1,
      workspaceId: WS1,
      targetType: 'USER' as const,
      targetId: USER1,
      scopeType: 'FEATURE' as const,
      scopeCode: 'X',
      accessLevel: AccessLevel.VIEW,
    };
    await service.assignPermission(input);
    expect(mocks.assignments.upsertAssignment).toHaveBeenCalledWith(input);
  });

  it('delegates listCellPermissions to assignments', async () => {
    const { service, mocks } = makeService();
    await service.listCellPermissions({ tenantId: T1, workspaceId: WS1, cellId: CELL1 });
    expect(mocks.assignments.listCellPermissions).toHaveBeenCalledWith({
      tenantId: T1,
      workspaceId: WS1,
      cellId: CELL1,
    });
  });

  it('delegates listRolePermissions to assignments.findAssignmentsForTarget', async () => {
    const { service, mocks } = makeService();
    await service.listRolePermissions({ workspaceId: WS1, roleId: ROLE1 });
    expect(mocks.assignments.findAssignmentsForTarget).toHaveBeenCalledWith({
      workspaceId: WS1,
      targetType: 'ROLE',
      targetIds: [ROLE1],
      scopeTypes: ['FEATURE', 'DOMAIN'],
    });
  });

  it('delegates removeCellPermission to assignments', async () => {
    const { service, mocks } = makeService();
    await service.removeCellPermission('assign-1');
    expect(mocks.assignments.removeCellPermission).toHaveBeenCalledWith('assign-1');
  });

  it('delegates removeWorkspacePermission to assignments', async () => {
    const { service, mocks } = makeService();
    await service.removeWorkspacePermission('assign-1', WS1);
    expect(mocks.assignments.removeWorkspacePermission).toHaveBeenCalledWith('assign-1', WS1);
  });
});

describe('AuthorizationService.createRole', () => {
  it('delegates to roles.createRole', async () => {
    const { service, mocks } = makeService();
    const input = { tenantId: T1, workspaceId: WS1, code: 'ADMIN', name: 'Admin' };
    await service.createRole(input);
    expect(mocks.roles.createRole).toHaveBeenCalledWith(input);
  });
});

describe('AuthorizationService.deleteRole', () => {
  it('removes assignments when role deletion succeeds', async () => {
    const { service, mocks } = makeService();
    const result = await service.deleteRole({ tenantId: T1, workspaceId: WS1, roleId: ROLE1 });
    expect(result).toBe(true);
    expect(mocks.roles.deleteRole).toHaveBeenCalledWith({ tenantId: T1, workspaceId: WS1, roleId: ROLE1 });
    expect(mocks.assignments.removeAssignmentsForTarget).toHaveBeenCalledWith({
      targetType: 'ROLE',
      targetId: ROLE1,
    });
  });

  it('does not remove assignments when role deletion returns false', async () => {
    const { service, mocks } = makeService({ roles: { deleteRole: vi.fn().mockResolvedValue(false) } });
    const result = await service.deleteRole({ tenantId: T1, workspaceId: WS1, roleId: ROLE1 });
    expect(result).toBe(false);
    expect(mocks.assignments.removeAssignmentsForTarget).not.toHaveBeenCalled();
  });
});

describe('AuthorizationService.assertNotLastOwner', () => {
  it('throws UnprocessableEntityException when count <= 1', async () => {
    const { service } = makeService({ roles: { countActiveOwners: vi.fn().mockResolvedValue(1) } });
    await expect(service.assertNotLastOwner(T1, WS1, 'cannot remove')).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
  });

  it('throws when count is 0', async () => {
    const { service } = makeService({ roles: { countActiveOwners: vi.fn().mockResolvedValue(0) } });
    await expect(service.assertNotLastOwner(T1, WS1, 'reason')).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
  });

  it('does not throw when count > 1', async () => {
    const { service } = makeService({ roles: { countActiveOwners: vi.fn().mockResolvedValue(2) } });
    await expect(service.assertNotLastOwner(T1, WS1, 'reason')).resolves.toBeUndefined();
  });
});

describe('AuthorizationService.role delegation methods', () => {
  it('delegates assignUserRole', async () => {
    const { service, mocks } = makeService();
    const input = { tenantId: T1, workspaceId: WS1, userId: USER1, roleId: ROLE1 };
    await service.assignUserRole(input);
    expect(mocks.roles.assignUserRole).toHaveBeenCalledWith(input);
  });

  it('delegates unassignUserRole', async () => {
    const { service, mocks } = makeService();
    const input = { tenantId: T1, workspaceId: WS1, userId: USER1, roleId: ROLE1 };
    await service.unassignUserRole(input);
    expect(mocks.roles.unassignUserRole).toHaveBeenCalledWith(input);
  });

  it('delegates findRoleByCode', async () => {
    const { service, mocks } = makeService();
    await service.findRoleByCode(T1, WS1, 'ADMIN');
    expect(mocks.roles.findRoleByCode).toHaveBeenCalledWith(T1, WS1, 'ADMIN');
  });

  it('delegates listRoles', async () => {
    const { service, mocks } = makeService();
    await service.listRoles(T1, WS1);
    expect(mocks.roles.listByWorkspace).toHaveBeenCalledWith(T1, WS1);
  });

  it('delegates countActiveOwners', async () => {
    const { service, mocks } = makeService();
    await service.countActiveOwners(T1, WS1);
    expect(mocks.roles.countActiveOwners).toHaveBeenCalledWith(T1, WS1);
  });

  it('delegates getRoleMembers', async () => {
    const { service, mocks } = makeService();
    await service.getRoleMembers(T1, WS1, ROLE1);
    expect(mocks.roles.getRoleMembers).toHaveBeenCalledWith({ tenantId: T1, workspaceId: WS1, roleId: ROLE1 });
  });
});

describe('AuthorizationService.group delegation methods', () => {
  it('delegates createGroup', async () => {
    const { service, mocks } = makeService();
    const input = { tenantId: T1, workspaceId: WS1, code: 'TEAM', name: 'Team' };
    await service.createGroup(input);
    expect(mocks.groups.createGroup).toHaveBeenCalledWith(input);
  });

  it('delegates assignUserGroup', async () => {
    const { service, mocks } = makeService();
    const input = { tenantId: T1, workspaceId: WS1, userId: USER1, groupId: GROUP1 };
    await service.assignUserGroup(input);
    expect(mocks.groups.assignUserGroup).toHaveBeenCalledWith(input);
  });
});

describe('AuthorizationService.getRoleScopeMatrix', () => {
  it('builds correct matrix from features, domains, and assignments', async () => {
    const features = [
      { id: 'f1', code: 'FEAT_A', description: 'Feature A', created_at: new Date() },
      { id: 'f2', code: 'FEAT_B', description: null, created_at: new Date() },
    ];
    const domains = [{ id: 'd1', code: 'DOM_A', description: 'Domain A', created_at: new Date() }];
    const assignments = [
      { id: 'perm-1', scope_type: 'FEATURE', scope_code: 'FEAT_A', access_level: 3 },
      { id: 'perm-2', scope_type: 'DOMAIN', scope_code: 'DOM_A', access_level: 2 },
    ];

    const { service } = makeService({
      registry: {
        listFeatures: vi.fn().mockResolvedValue(features),
        listDomains: vi.fn().mockResolvedValue(domains),
      },
      assignments: {
        findAssignmentsForTarget: vi.fn().mockResolvedValue(assignments),
      },
    });

    const matrix = await service.getRoleScopeMatrix(WS1, ROLE1);

    expect(matrix).toEqual([
      { scopeType: 'FEATURE', scopeCode: 'FEAT_A', description: 'Feature A', accessLevel: 3, permissionId: 'perm-1' },
      { scopeType: 'FEATURE', scopeCode: 'FEAT_B', description: null, accessLevel: 0, permissionId: null },
      { scopeType: 'DOMAIN', scopeCode: 'DOM_A', description: 'Domain A', accessLevel: 2, permissionId: 'perm-2' },
    ]);
  });

  it('returns all zeroes when no assignments exist', async () => {
    const features = [{ id: 'f1', code: 'FEAT_A', description: null, created_at: new Date() }];
    const domains = [{ id: 'd1', code: 'DOM_A', description: null, created_at: new Date() }];

    const { service } = makeService({
      registry: {
        listFeatures: vi.fn().mockResolvedValue(features),
        listDomains: vi.fn().mockResolvedValue(domains),
      },
      assignments: {
        findAssignmentsForTarget: vi.fn().mockResolvedValue([]),
      },
    });

    const matrix = await service.getRoleScopeMatrix(WS1, ROLE1);

    expect(matrix).toEqual([
      { scopeType: 'FEATURE', scopeCode: 'FEAT_A', description: null, accessLevel: 0, permissionId: null },
      { scopeType: 'DOMAIN', scopeCode: 'DOM_A', description: null, accessLevel: 0, permissionId: null },
    ]);
  });
});

describe('AuthorizationService.getOrResolveScopes (private, tested through canFeature)', () => {
  it('reuses existing principal scopes when featureScopes is set', async () => {
    const { service, mocks } = makeService();
    await service.canFeature(
      { userId: USER1, workspaceId: WS1, featureScopes: { X: 1 } },
      'X',
      AccessLevel.VIEW,
    );
    expect(mocks.resolver.resolvePermissions).not.toHaveBeenCalled();
  });

  it('reuses existing principal scopes when domainScopes is set but featureScopes is not', async () => {
    const { service, mocks } = makeService();
    await service.canFeature(
      { userId: USER1, workspaceId: WS1, domainScopes: { X: 1 } },
      'MISSING',
      AccessLevel.VIEW,
    );
    // The domainScopes being present triggers the "already resolved" branch,
    // featureScopes defaults to {} so the feature check returns false
    expect(mocks.resolver.resolvePermissions).not.toHaveBeenCalled();
  });

  it('resolves fresh scopes when neither featureScopes nor domainScopes is set', async () => {
    const { service, mocks } = makeService();
    await service.canFeature(
      { userId: USER1, workspaceId: WS1, cellId: CELL1 },
      'workspace_create',
      AccessLevel.VIEW,
    );
    expect(mocks.resolver.resolvePermissions).toHaveBeenCalledWith(USER1, WS1, CELL1);
  });
});

describe('AuthorizationService.getTenantDomainScopes', () => {
  it('resolves and converts to numeric map', async () => {
    const { service } = makeService();
    const result = await service.getTenantDomainScopes(USER1, T1);
    expect(result).toEqual({ BILLING: 2 });
  });
});
