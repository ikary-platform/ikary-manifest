import { describe, expect, it } from 'vitest';
import { AuthorizationConfigService } from './authorization-config.service';
import type { AuthorizationModuleOptions } from './authorization-options.schema';

function makeService(overrides: Partial<AuthorizationModuleOptions> = {}): AuthorizationConfigService {
  const options: AuthorizationModuleOptions = {
    database: { connectionString: 'postgres://localhost/test', ssl: false, maxPoolSize: 10 },
    mode: 'both',
    assignmentLevel: 'user-role-group',
    ...overrides,
  };
  return new (AuthorizationConfigService as any)(options) as AuthorizationConfigService;
}

describe('AuthorizationConfigService', () => {
  describe('getters', () => {
    it('returns the full config object', () => {
      const service = makeService();
      expect(service.config).toEqual({
        database: { connectionString: 'postgres://localhost/test', ssl: false, maxPoolSize: 10 },
        mode: 'both',
        assignmentLevel: 'user-role-group',
      });
    });

    it('returns the mode', () => {
      const service = makeService({ mode: 'feature' });
      expect(service.mode).toBe('feature');
    });

    it('returns the assignmentLevel', () => {
      const service = makeService({ assignmentLevel: 'user' });
      expect(service.assignmentLevel).toBe('user');
    });

    it('returns allowedScopeTypes for "both" mode', () => {
      const service = makeService({ mode: 'both' });
      expect(service.allowedScopeTypes).toEqual(['FEATURE', 'DOMAIN']);
    });

    it('returns allowedScopeTypes for "feature" mode', () => {
      const service = makeService({ mode: 'feature' });
      expect(service.allowedScopeTypes).toEqual(['FEATURE']);
    });

    it('returns allowedScopeTypes for "domain" mode', () => {
      const service = makeService({ mode: 'domain' });
      expect(service.allowedScopeTypes).toEqual(['DOMAIN']);
    });

    it('returns allowedTargetTypes for "user-role-group"', () => {
      const service = makeService({ assignmentLevel: 'user-role-group' });
      expect(service.allowedTargetTypes).toEqual(['USER', 'ROLE', 'GROUP']);
    });

    it('returns allowedTargetTypes for "user"', () => {
      const service = makeService({ assignmentLevel: 'user' });
      expect(service.allowedTargetTypes).toEqual(['USER']);
    });

    it('returns allowedTargetTypes for "user-role"', () => {
      const service = makeService({ assignmentLevel: 'user-role' });
      expect(service.allowedTargetTypes).toEqual(['USER', 'ROLE']);
    });

    it('returns allowedTargetTypes for "user-group"', () => {
      const service = makeService({ assignmentLevel: 'user-group' });
      expect(service.allowedTargetTypes).toEqual(['USER', 'GROUP']);
    });
  });

  describe('isScopeTypeAllowed', () => {
    it('allows FEATURE in "feature" mode', () => {
      const service = makeService({ mode: 'feature' });
      expect(service.isScopeTypeAllowed('FEATURE')).toBe(true);
    });

    it('disallows DOMAIN in "feature" mode', () => {
      const service = makeService({ mode: 'feature' });
      expect(service.isScopeTypeAllowed('DOMAIN')).toBe(false);
    });

    it('allows DOMAIN in "domain" mode', () => {
      const service = makeService({ mode: 'domain' });
      expect(service.isScopeTypeAllowed('DOMAIN')).toBe(true);
    });

    it('disallows FEATURE in "domain" mode', () => {
      const service = makeService({ mode: 'domain' });
      expect(service.isScopeTypeAllowed('FEATURE')).toBe(false);
    });

    it('allows both FEATURE and DOMAIN in "both" mode', () => {
      const service = makeService({ mode: 'both' });
      expect(service.isScopeTypeAllowed('FEATURE')).toBe(true);
      expect(service.isScopeTypeAllowed('DOMAIN')).toBe(true);
    });
  });

  describe('isTargetTypeAllowed', () => {
    it('allows USER in "user" level', () => {
      const service = makeService({ assignmentLevel: 'user' });
      expect(service.isTargetTypeAllowed('USER')).toBe(true);
    });

    it('disallows ROLE in "user" level', () => {
      const service = makeService({ assignmentLevel: 'user' });
      expect(service.isTargetTypeAllowed('ROLE')).toBe(false);
    });

    it('disallows GROUP in "user" level', () => {
      const service = makeService({ assignmentLevel: 'user' });
      expect(service.isTargetTypeAllowed('GROUP')).toBe(false);
    });

    it('allows USER and ROLE in "user-role" level', () => {
      const service = makeService({ assignmentLevel: 'user-role' });
      expect(service.isTargetTypeAllowed('USER')).toBe(true);
      expect(service.isTargetTypeAllowed('ROLE')).toBe(true);
    });

    it('disallows GROUP in "user-role" level', () => {
      const service = makeService({ assignmentLevel: 'user-role' });
      expect(service.isTargetTypeAllowed('GROUP')).toBe(false);
    });

    it('allows all in "user-role-group" level', () => {
      const service = makeService({ assignmentLevel: 'user-role-group' });
      expect(service.isTargetTypeAllowed('USER')).toBe(true);
      expect(service.isTargetTypeAllowed('ROLE')).toBe(true);
      expect(service.isTargetTypeAllowed('GROUP')).toBe(true);
    });
  });

  describe('isFeatureModeEnabled', () => {
    it('returns true for "feature" mode', () => {
      expect(makeService({ mode: 'feature' }).isFeatureModeEnabled()).toBe(true);
    });

    it('returns true for "both" mode', () => {
      expect(makeService({ mode: 'both' }).isFeatureModeEnabled()).toBe(true);
    });

    it('returns false for "domain" mode', () => {
      expect(makeService({ mode: 'domain' }).isFeatureModeEnabled()).toBe(false);
    });
  });

  describe('isDomainModeEnabled', () => {
    it('returns true for "domain" mode', () => {
      expect(makeService({ mode: 'domain' }).isDomainModeEnabled()).toBe(true);
    });

    it('returns true for "both" mode', () => {
      expect(makeService({ mode: 'both' }).isDomainModeEnabled()).toBe(true);
    });

    it('returns false for "feature" mode', () => {
      expect(makeService({ mode: 'feature' }).isDomainModeEnabled()).toBe(false);
    });
  });

  describe('includesRoleAssignments', () => {
    it('returns true for "user-role" level', () => {
      expect(makeService({ assignmentLevel: 'user-role' }).includesRoleAssignments()).toBe(true);
    });

    it('returns true for "user-role-group" level', () => {
      expect(makeService({ assignmentLevel: 'user-role-group' }).includesRoleAssignments()).toBe(true);
    });

    it('returns false for "user" level', () => {
      expect(makeService({ assignmentLevel: 'user' }).includesRoleAssignments()).toBe(false);
    });

    it('returns false for "user-group" level', () => {
      expect(makeService({ assignmentLevel: 'user-group' }).includesRoleAssignments()).toBe(false);
    });
  });

  describe('includesGroupAssignments', () => {
    it('returns true for "user-group" level', () => {
      expect(makeService({ assignmentLevel: 'user-group' }).includesGroupAssignments()).toBe(true);
    });

    it('returns true for "user-role-group" level', () => {
      expect(makeService({ assignmentLevel: 'user-role-group' }).includesGroupAssignments()).toBe(true);
    });

    it('returns false for "user" level', () => {
      expect(makeService({ assignmentLevel: 'user' }).includesGroupAssignments()).toBe(false);
    });

    it('returns false for "user-role" level', () => {
      expect(makeService({ assignmentLevel: 'user-role' }).includesGroupAssignments()).toBe(false);
    });
  });
});
