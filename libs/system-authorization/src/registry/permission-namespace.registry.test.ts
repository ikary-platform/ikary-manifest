import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { PermissionNamespaceRegistry } from './permission-namespace.registry';

function makeRegistry(overrides: { registry?: Record<string, any> } = {}) {
  const registry = {
    registerFeature: vi.fn().mockResolvedValue(undefined),
    ...overrides.registry,
  };

  return {
    service: new (PermissionNamespaceRegistry as any)(registry) as PermissionNamespaceRegistry,
    mocks: { registry },
  };
}

describe('PermissionNamespaceRegistry.registerPermission', () => {
  it('validates format and delegates to registry.registerFeature', async () => {
    const { service, mocks } = makeRegistry();
    await service.registerPermission('workspace.member.invite', 'Invite members');
    expect(mocks.registry.registerFeature).toHaveBeenCalledWith('WORKSPACE.MEMBER.INVITE', 'Invite members');
  });

  it('uppercases the code before registering', async () => {
    const { service, mocks } = makeRegistry();
    await service.registerPermission('App.Resource.Action');
    expect(mocks.registry.registerFeature).toHaveBeenCalledWith('APP.RESOURCE.ACTION', undefined);
  });

  it('throws BadRequestException for code with fewer than 3 segments', async () => {
    const { service } = makeRegistry();
    await expect(service.registerPermission('NAMESPACE.RESOURCE')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequestException for code with empty segment', async () => {
    const { service } = makeRegistry();
    await expect(service.registerPermission('NAMESPACE..ACTION')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequestException for code with invalid characters', async () => {
    const { service } = makeRegistry();
    await expect(service.registerPermission('NAMESPACE.RES-OURCE.ACTION')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('accepts codes with more than 3 segments', async () => {
    const { service, mocks } = makeRegistry();
    await service.registerPermission('NS.RES.SUB.ACTION');
    expect(mocks.registry.registerFeature).toHaveBeenCalledWith('NS.RES.SUB.ACTION', undefined);
  });

  it('trims whitespace from the code', async () => {
    const { service, mocks } = makeRegistry();
    await service.registerPermission('  WORKSPACE.MEMBER.INVITE  ');
    expect(mocks.registry.registerFeature).toHaveBeenCalledWith('WORKSPACE.MEMBER.INVITE', undefined);
  });
});

describe('PermissionNamespaceRegistry.registerPermissions', () => {
  it('validates all codes before registering any', async () => {
    const { service, mocks } = makeRegistry();
    await service.registerPermissions([
      { code: 'NS.RES.ACT1', description: 'First' },
      { code: 'NS.RES.ACT2', description: 'Second' },
    ]);

    expect(mocks.registry.registerFeature).toHaveBeenCalledTimes(2);
    expect(mocks.registry.registerFeature).toHaveBeenCalledWith('NS.RES.ACT1', 'First');
    expect(mocks.registry.registerFeature).toHaveBeenCalledWith('NS.RES.ACT2', 'Second');
  });

  it('throws on the first invalid code without registering any', async () => {
    const { service, mocks } = makeRegistry();
    await expect(
      service.registerPermissions([
        { code: 'VALID.RES.ACT' },
        { code: 'INVALID' },
      ]),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(mocks.registry.registerFeature).not.toHaveBeenCalled();
  });

  it('handles an empty array without error', async () => {
    const { service, mocks } = makeRegistry();
    await service.registerPermissions([]);
    expect(mocks.registry.registerFeature).not.toHaveBeenCalled();
  });
});

describe('PermissionNamespaceRegistry.parseCode', () => {
  it('extracts namespace, resource, and action from a 3-segment code', () => {
    const { service } = makeRegistry();
    const result = service.parseCode('workspace.member.invite');
    expect(result).toEqual({
      namespace: 'WORKSPACE',
      resource: 'MEMBER',
      action: 'INVITE',
      full: 'WORKSPACE.MEMBER.INVITE',
    });
  });

  it('handles codes with more than 3 segments (action includes remaining segments)', () => {
    const { service } = makeRegistry();
    const result = service.parseCode('NS.RES.SUB.ACT');
    expect(result).toEqual({
      namespace: 'NS',
      resource: 'RES',
      action: 'SUB.ACT',
      full: 'NS.RES.SUB.ACT',
    });
  });

  it('throws BadRequestException for invalid code format', () => {
    const { service } = makeRegistry();
    expect(() => service.parseCode('ONLY_TWO')).toThrow(BadRequestException);
  });

  it('throws BadRequestException for single segment code', () => {
    const { service } = makeRegistry();
    expect(() => service.parseCode('SINGLE')).toThrow(BadRequestException);
  });

  it('uppercases the segments', () => {
    const { service } = makeRegistry();
    const result = service.parseCode('lower.case.code');
    expect(result.namespace).toBe('LOWER');
    expect(result.resource).toBe('CASE');
    expect(result.action).toBe('CODE');
  });
});

describe('PermissionNamespaceRegistry.isValidCode', () => {
  it('returns true for valid 3-segment code', () => {
    const { service } = makeRegistry();
    expect(service.isValidCode('WORKSPACE.MEMBER.INVITE')).toBe(true);
  });

  it('returns true for valid code with more than 3 segments', () => {
    const { service } = makeRegistry();
    expect(service.isValidCode('NS.RES.SUB.ACT')).toBe(true);
  });

  it('returns true for lowercase valid code', () => {
    const { service } = makeRegistry();
    expect(service.isValidCode('workspace.member.invite')).toBe(true);
  });

  it('returns true for code with digits and underscores', () => {
    const { service } = makeRegistry();
    expect(service.isValidCode('NS_1.RES_2.ACT_3')).toBe(true);
  });

  it('returns false for code with fewer than 3 segments', () => {
    const { service } = makeRegistry();
    expect(service.isValidCode('NAMESPACE.RESOURCE')).toBe(false);
  });

  it('returns false for single-word code', () => {
    const { service } = makeRegistry();
    expect(service.isValidCode('SINGLE')).toBe(false);
  });

  it('returns false for empty string', () => {
    const { service } = makeRegistry();
    expect(service.isValidCode('')).toBe(false);
  });

  it('returns false for code with empty segment', () => {
    const { service } = makeRegistry();
    expect(service.isValidCode('NS..ACT')).toBe(false);
  });

  it('returns false for code with invalid characters (hyphen)', () => {
    const { service } = makeRegistry();
    expect(service.isValidCode('NS.RES-OURCE.ACT')).toBe(false);
  });

  it('returns false for code with spaces in segments', () => {
    const { service } = makeRegistry();
    expect(service.isValidCode('NS.RES OURCE.ACT')).toBe(false);
  });
});
