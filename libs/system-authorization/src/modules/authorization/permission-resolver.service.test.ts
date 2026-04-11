import { describe, expect, it, vi } from 'vitest';
import { AccessLevel } from '../../interfaces/access-level.enum';
import { PermissionResolverService } from './permission-resolver.service';

const USER1 = '30000000-0000-0000-0000-000000000001';
const WS1 = '20000000-0000-0000-0000-000000000001';
const T1 = '10000000-0000-0000-0000-000000000001';
const CELL1 = '50000000-0000-0000-0000-000000000001';

const FEATURE_ASSIGNMENT = {
  id: 'a1',
  scope_type: 'FEATURE' as const,
  scope_code: 'WORKSPACE_CREATE',
  access_level: AccessLevel.EDIT,
};

const DOMAIN_ASSIGNMENT = {
  id: 'a2',
  scope_type: 'DOMAIN' as const,
  scope_code: 'BILLING',
  access_level: AccessLevel.VIEW,
};

function makeService(
  overrides: {
    config?: Record<string, any>;
    assignments?: Record<string, any>;
    roles?: Record<string, any>;
    groups?: Record<string, any>;
  } = {},
) {
  const config = {
    allowedScopeTypes: ['FEATURE', 'DOMAIN'],
    includesRoleAssignments: vi.fn().mockReturnValue(false),
    includesGroupAssignments: vi.fn().mockReturnValue(false),
    ...overrides.config,
  };

  const assignments = {
    findAssignmentsForTarget: vi.fn().mockResolvedValue([]),
    findTenantDomainAssignmentsForUser: vi.fn().mockResolvedValue([]),
    ...overrides.assignments,
  };

  const roles = {
    getRoleIdsForUser: vi.fn().mockResolvedValue([]),
    ...overrides.roles,
  };

  const groups = {
    getGroupIdsForUser: vi.fn().mockResolvedValue([]),
    ...overrides.groups,
  };

  return {
    service: new (PermissionResolverService as any)(config, assignments, roles, groups) as PermissionResolverService,
    mocks: { config, assignments, roles, groups },
  };
}

describe('PermissionResolverService.resolvePermissions', () => {
  it('collects user assignments and buckets FEATURE vs DOMAIN correctly', async () => {
    const { service } = makeService({
      assignments: {
        findAssignmentsForTarget: vi.fn().mockResolvedValue([FEATURE_ASSIGNMENT, DOMAIN_ASSIGNMENT]),
      },
    });

    const result = await service.resolvePermissions(USER1, WS1);

    expect(result.featureScopes).toEqual({ WORKSPACE_CREATE: AccessLevel.EDIT });
    expect(result.domainScopes).toEqual({ BILLING: AccessLevel.VIEW });
  });

  it('passes cellId through to findAssignmentsForTarget', async () => {
    const findAssignmentsForTarget = vi.fn().mockResolvedValue([]);
    const { service } = makeService({
      assignments: { findAssignmentsForTarget },
    });

    await service.resolvePermissions(USER1, WS1, CELL1);

    expect(findAssignmentsForTarget).toHaveBeenCalledWith(
      expect.objectContaining({ cellId: CELL1 }),
    );
  });

  it('includes role assignments when config.includesRoleAssignments() returns true', async () => {
    const roleAssignment = { ...FEATURE_ASSIGNMENT, id: 'ra1', access_level: AccessLevel.VIEW };
    const findAssignmentsForTarget = vi
      .fn()
      .mockResolvedValueOnce([FEATURE_ASSIGNMENT]) // user assignments
      .mockResolvedValueOnce([roleAssignment]); // role assignments

    const { service, mocks } = makeService({
      config: {
        allowedScopeTypes: ['FEATURE', 'DOMAIN'],
        includesRoleAssignments: vi.fn().mockReturnValue(true),
        includesGroupAssignments: vi.fn().mockReturnValue(false),
      },
      assignments: { findAssignmentsForTarget },
      roles: { getRoleIdsForUser: vi.fn().mockResolvedValue(['role-1']) },
    });

    const result = await service.resolvePermissions(USER1, WS1);

    expect(mocks.roles.getRoleIdsForUser).toHaveBeenCalledWith(WS1, USER1);
    // EDIT (2) > VIEW (1), so EDIT wins
    expect(result.featureScopes.WORKSPACE_CREATE).toBe(AccessLevel.EDIT);
  });

  it('includes group assignments when config.includesGroupAssignments() returns true', async () => {
    const groupAssignment = {
      id: 'ga1',
      scope_type: 'DOMAIN' as const,
      scope_code: 'BILLING',
      access_level: AccessLevel.ADMIN,
    };
    const findAssignmentsForTarget = vi
      .fn()
      .mockResolvedValueOnce([DOMAIN_ASSIGNMENT]) // user assignments
      .mockResolvedValueOnce([groupAssignment]); // group assignments

    const { service, mocks } = makeService({
      config: {
        allowedScopeTypes: ['FEATURE', 'DOMAIN'],
        includesRoleAssignments: vi.fn().mockReturnValue(false),
        includesGroupAssignments: vi.fn().mockReturnValue(true),
      },
      assignments: { findAssignmentsForTarget },
      groups: { getGroupIdsForUser: vi.fn().mockResolvedValue(['group-1']) },
    });

    const result = await service.resolvePermissions(USER1, WS1);

    expect(mocks.groups.getGroupIdsForUser).toHaveBeenCalledWith(WS1, USER1);
    // ADMIN (4) > VIEW (1), so ADMIN wins
    expect(result.domainScopes.BILLING).toBe(AccessLevel.ADMIN);
  });

  it('max access level wins when multiple assignments exist for the same scope', async () => {
    const low = { ...FEATURE_ASSIGNMENT, id: 'a-low', access_level: AccessLevel.VIEW };
    const high = { ...FEATURE_ASSIGNMENT, id: 'a-high', access_level: AccessLevel.ADMIN };

    const { service } = makeService({
      assignments: { findAssignmentsForTarget: vi.fn().mockResolvedValue([low, high]) },
    });

    const result = await service.resolvePermissions(USER1, WS1);

    expect(result.featureScopes.WORKSPACE_CREATE).toBe(AccessLevel.ADMIN);
  });

  it('returns empty maps when no assignments are found', async () => {
    const { service } = makeService();
    const result = await service.resolvePermissions(USER1, WS1);
    expect(result.featureScopes).toEqual({});
    expect(result.domainScopes).toEqual({});
  });

  it('includes both role and group assignments when both are enabled', async () => {
    const userAssignment = { ...FEATURE_ASSIGNMENT, id: 'u1', access_level: AccessLevel.VIEW };
    const roleAssignment = { ...FEATURE_ASSIGNMENT, id: 'r1', access_level: AccessLevel.EDIT };
    const groupAssignment = { ...FEATURE_ASSIGNMENT, id: 'g1', access_level: AccessLevel.ADMIN };

    const findAssignmentsForTarget = vi
      .fn()
      .mockResolvedValueOnce([userAssignment])  // user
      .mockResolvedValueOnce([roleAssignment])  // role
      .mockResolvedValueOnce([groupAssignment]); // group

    const { service } = makeService({
      config: {
        allowedScopeTypes: ['FEATURE', 'DOMAIN'],
        includesRoleAssignments: vi.fn().mockReturnValue(true),
        includesGroupAssignments: vi.fn().mockReturnValue(true),
      },
      assignments: { findAssignmentsForTarget },
      roles: { getRoleIdsForUser: vi.fn().mockResolvedValue(['role-1']) },
      groups: { getGroupIdsForUser: vi.fn().mockResolvedValue(['group-1']) },
    });

    const result = await service.resolvePermissions(USER1, WS1);

    expect(result.featureScopes.WORKSPACE_CREATE).toBe(AccessLevel.ADMIN);
  });
});

describe('PermissionResolverService.resolveTenantDomainPermissions', () => {
  it('returns domain scopes for tenant assignments', async () => {
    const assignments = [
      { scope_code: 'BILLING', access_level: AccessLevel.EDIT },
      { scope_code: 'USERS', access_level: AccessLevel.VIEW },
    ];

    const { service } = makeService({
      assignments: { findTenantDomainAssignmentsForUser: vi.fn().mockResolvedValue(assignments) },
    });

    const result = await service.resolveTenantDomainPermissions(USER1, T1);

    expect(result).toEqual({
      BILLING: AccessLevel.EDIT,
      USERS: AccessLevel.VIEW,
    });
  });

  it('max access level wins for duplicate scope codes', async () => {
    const assignments = [
      { scope_code: 'BILLING', access_level: AccessLevel.VIEW },
      { scope_code: 'BILLING', access_level: AccessLevel.ADMIN },
    ];

    const { service } = makeService({
      assignments: { findTenantDomainAssignmentsForUser: vi.fn().mockResolvedValue(assignments) },
    });

    const result = await service.resolveTenantDomainPermissions(USER1, T1);

    expect(result.BILLING).toBe(AccessLevel.ADMIN);
  });

  it('keeps higher access level when lower duplicate comes second', async () => {
    const assignments = [
      { scope_code: 'BILLING', access_level: AccessLevel.ADMIN },
      { scope_code: 'BILLING', access_level: AccessLevel.VIEW },
    ];

    const { service } = makeService({
      assignments: { findTenantDomainAssignmentsForUser: vi.fn().mockResolvedValue(assignments) },
    });

    const result = await service.resolveTenantDomainPermissions(USER1, T1);

    expect(result.BILLING).toBe(AccessLevel.ADMIN);
  });

  it('returns empty map when no tenant domain assignments exist', async () => {
    const { service } = makeService();
    const result = await service.resolveTenantDomainPermissions(USER1, T1);
    expect(result).toEqual({});
  });
});
