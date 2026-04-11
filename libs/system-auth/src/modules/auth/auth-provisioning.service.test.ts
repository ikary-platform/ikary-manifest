import { test, expect } from 'vitest';
import { ConflictException, UnprocessableEntityException } from '@nestjs/common';
import { AuthProvisioningService } from './auth-provisioning.service';

function createService(overrides?: {
  existingUser?: {
    id: string;
    email: string;
    deleted_at: Date | null;
    is_email_verified: boolean;
  } | null;
  existingOrganization?: {
    id: string;
    tenant_id: string;
    slug: string;
    created_by_user_id: string | null;
    deleted_at: Date | null;
  } | null;
  existingMembership?: { id: string } | null;
}) {
  const calls = {
    markEmailVerified: [] as string[],
    createUser: [] as Array<{ email: string; passwordHash: string }>,
    createWorkspace: [] as Array<{ tenantId: string; name: string; slug: string; createdByUserId: string }>,
    createMembership: [] as Array<{ workspaceId: string; userId: string; status?: 'active' | 'invited' | 'suspended' }>,
  };

  const service = new AuthProvisioningService(
    {
      config: {
        classic: {
          passwordMinLength: 10,
        },
      },
    } as never,
    {
      findByEmail: async () => overrides?.existingUser ?? null,
      create: async (email: string, passwordHash: string) => {
        calls.createUser.push({ email, passwordHash });
        return {
          id: 'user-1',
          email,
          password_hash: passwordHash,
          deleted_at: null,
          is_email_verified: false,
        };
      },
      markEmailVerified: async (userId: string) => {
        calls.markEmailVerified.push(userId);
      },
    } as never,
    {
      findBySlug: async () => overrides?.existingOrganization ?? null,
      create: async (input: { tenantId: string; name: string; slug: string; createdByUserId: string }) => {
        calls.createWorkspace.push(input);
        return {
          id: 'org-1',
          tenant_id: input.tenantId,
          name: input.name,
          slug: input.slug,
          created_by_user_id: input.createdByUserId,
          deleted_at: null,
        };
      },
    } as never,
    {
      findActive: async () => overrides?.existingMembership ?? null,
      create: async (input: { workspaceId: string; userId: string; status?: 'active' | 'invited' | 'suspended' }) => {
        calls.createMembership.push(input);
        return {
          id: 'membership-1',
          workspace_id: input.workspaceId,
          user_id: input.userId,
          status: input.status ?? 'active',
          deleted_at: null,
        };
      },
    } as never,
    {
      hashPassword: async () => 'hashed-password',
    } as never,
    {
      withTransaction: async <T>(handler: (client: unknown) => Promise<T>) =>
        handler({
          insertInto: () => ({
            values: () => ({
              returning: () => ({
                executeTakeFirstOrThrow: async () => ({ id: 'tenant-1' }),
              }),
              onConflict: () => ({
                execute: async () => undefined,
              }),
            }),
          }),
        }),
    } as never,
  );

  return { service, calls };
}

test('provisionClassicUser creates user, organization, and membership for a new bootstrap user', async () => {
  const { service, calls } = createService();

  const result = await service.provisionClassicUser({
    email: 'Admin@Example.com',
    password: 'bootstrap-pass',
    workspaceName: 'Control Plane',
    workspaceSlug: 'control-plane',
    markEmailVerified: true,
  });

  expect(result).toEqual({
    userId: 'user-1',
    tenantId: 'tenant-1',
    workspaceId: 'org-1',
    created: true,
  });
  expect(calls.createUser.length).toBe(1);
  expect(calls.createUser[0]?.email).toBe('admin@example.com');
  expect(calls.createWorkspace.length).toBe(1);
  expect(calls.createMembership.length).toBe(1);
  expect(calls.markEmailVerified).toEqual(['user-1']);
});

test('provisionClassicUser is idempotent for the same user and organization', async () => {
  const { service, calls } = createService({
    existingUser: {
      id: 'user-existing',
      email: 'admin@example.com',
      deleted_at: null,
      is_email_verified: false,
    },
    existingOrganization: {
      id: 'org-existing',
      tenant_id: 'tenant-existing',
      slug: 'control-plane',
      created_by_user_id: 'user-existing',
      deleted_at: null,
    },
    existingMembership: {
      id: 'membership-existing',
    },
  });

  const result = await service.provisionClassicUser({
    email: 'admin@example.com',
    password: 'bootstrap-pass',
    workspaceName: 'Control Plane',
    workspaceSlug: 'control-plane',
    markEmailVerified: true,
  });

  expect(result).toEqual({
    userId: 'user-existing',
    tenantId: 'tenant-existing',
    workspaceId: 'org-existing',
    created: false,
  });
  expect(calls.createUser.length).toBe(0);
  expect(calls.createWorkspace.length).toBe(0);
  expect(calls.createMembership.length).toBe(0);
  expect(calls.markEmailVerified).toEqual(['user-existing']);
});

test('provisionClassicUser fails when the organization slug belongs to a different owner', async () => {
  const { service } = createService({
    existingUser: {
      id: 'user-existing',
      email: 'admin@example.com',
      deleted_at: null,
      is_email_verified: true,
    },
    existingOrganization: {
      id: 'org-existing',
      tenant_id: 'tenant-existing',
      slug: 'control-plane',
      created_by_user_id: 'someone-else',
      deleted_at: null,
    },
    existingMembership: {
      id: 'membership-existing',
    },
  });

  await expect(() =>
    service.provisionClassicUser({
      email: 'admin@example.com',
      password: 'bootstrap-pass',
      workspaceName: 'Control Plane',
      workspaceSlug: 'control-plane',
    }),
  ).rejects.toThrow(ConflictException);
});

test('provisionClassicUser enforces the shared password policy', async () => {
  const { service } = createService();

  await expect(() =>
    service.provisionClassicUser({
      email: 'admin@example.com',
      password: 'short',
      workspaceName: 'Control Plane',
      workspaceSlug: 'control-plane',
    }),
  ).rejects.toThrow(UnprocessableEntityException);
});
