import { randomUUID } from 'node:crypto';
import { ConflictException, Inject, Injectable, Optional, UnprocessableEntityException } from '@nestjs/common';
import { z } from 'zod';
import { AuthConfigService } from '../../config/auth-config.service';
import { HashService } from '../../common/hash.service';
import { DatabaseService, type Queryable } from '../../database/database.service';
import type { AuthDatabaseSchema } from '../../database/schema';
import { WorkspaceMembershipRepository } from '../workspace-membership/workspace-membership.repository';
import { WorkspaceRepository } from '../workspace/workspace.repository';
import { UserService } from '../user/user.service';
import { WORKSPACE_LIFECYCLE_PORT, type WorkspaceLifecyclePort } from '../workspace/workspace-lifecycle.port';

const provisionClassicUserSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email()
      .transform((value) => value.toLowerCase()),
    password: z.string().min(1),
    workspaceName: z.string().trim().min(2).max(255).optional(),
    workspaceSlug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9-]{3,120}$/)
      .optional(),
    tenantId: z.string().uuid().optional(),
    workspaceId: z.string().uuid().optional(),
    markEmailVerified: z.boolean().optional().default(false),
  })
  .superRefine((value, ctx) => {
    const hasExistingTarget = Boolean(value.tenantId || value.workspaceId);

    if (hasExistingTarget && (!value.tenantId || !value.workspaceId)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'tenantId and workspaceId must be provided together.' });
    }

    if (!hasExistingTarget && (!value.workspaceName || !value.workspaceSlug)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'workspaceName and workspaceSlug are required when no existing workspace is provided.',
      });
    }
  });

export interface ProvisionClassicUserInput {
  email: string;
  password: string;
  workspaceName?: string;
  workspaceSlug?: string;
  tenantId?: string;
  workspaceId?: string;
  markEmailVerified?: boolean;
}

export interface ProvisionClassicUserResult {
  userId: string;
  tenantId: string;
  workspaceId: string;
  created: boolean;
}

@Injectable()
export class AuthProvisioningService {
  constructor(
    @Inject(AuthConfigService) private readonly configService: AuthConfigService,
    @Inject(UserService) private readonly users: UserService,
    @Inject(WorkspaceRepository) private readonly workspaces: WorkspaceRepository,
    @Inject(WorkspaceMembershipRepository) private readonly memberships: WorkspaceMembershipRepository,
    @Inject(HashService) private readonly hashService: HashService,
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Optional()
    @Inject(WORKSPACE_LIFECYCLE_PORT)
    private readonly workspaceLifecycle: WorkspaceLifecyclePort | null = null,
  ) {}

  async provisionClassicUser(input: ProvisionClassicUserInput): Promise<ProvisionClassicUserResult> {
    const parsed = provisionClassicUserSchema.parse(input);
    this.assertPasswordPolicy(parsed.password);

    return this.db.withTransaction(async (client) => {
      const existingUser = await this.users.findByEmail(parsed.email, client);
      const target = await this.resolveProvisioningTarget(parsed, client);

      if (existingUser && !existingUser.deleted_at) {
        if (!target.workspace || target.workspace.deleted_at) {
          throw new ConflictException('Requested workspace does not exist.');
        }

        if (target.mode === 'slug-existing' && target.workspace.created_by_user_id !== existingUser.id) {
          throw new ConflictException('Requested workspace already exists for a different owner.');
        }

        const membership = await this.memberships.findActive(target.workspace.id, existingUser.id, client);
        if (!membership) {
          await this.memberships.create(
            {
              tenantId: target.tenantId,
              workspaceId: target.workspace.id,
              userId: existingUser.id,
              status: 'active',
            },
            client,
          );
        }

        await this.ensureTenantMembership(target.tenantId, existingUser.id, client);

        if (parsed.markEmailVerified && !existingUser.is_email_verified) {
          await this.users.markEmailVerified(existingUser.id, client);
        }

        return {
          userId: existingUser.id,
          tenantId: target.tenantId,
          workspaceId: target.workspace.id,
          created: false,
        };
      }

      if (target.mode === 'slug-existing') {
        throw new ConflictException('Workspace slug is already in use.');
      }

      const passwordHash = await this.hashService.hashPassword(parsed.password);
      const user = await this.users.create(parsed.email, passwordHash, client);

      if (target.mode !== 'new') {
        await this.memberships.create(
          {
            tenantId: target.tenantId,
            workspaceId: target.workspace.id,
            userId: user.id,
            status: 'active',
          },
          client,
        );

        await this.ensureTenantMembership(target.tenantId, user.id, client);
      } else {
        const tenantId = randomUUID();
        const tenant = await client
          .insertInto('tenants')
          .values({
            id: tenantId,
            name: parsed.workspaceName!,
            slug: parsed.workspaceSlug!,
            status: 'ACTIVE',
            default_language: 'en',
            created_by: user.id,
            updated_by: user.id,
          })
          .returning(['id'])
          .executeTakeFirstOrThrow();

        await this.ensureTenantMembership(tenant.id, user.id, client);

        const workspace = await this.workspaces.create(
          {
            tenantId: tenant.id,
            name: parsed.workspaceName!,
            slug: parsed.workspaceSlug!,
            createdByUserId: user.id,
          },
          client,
        );

        await this.memberships.create(
          {
            tenantId: tenant.id,
            workspaceId: workspace.id,
            userId: user.id,
            status: 'active',
          },
          client,
        );

        await this.workspaceLifecycle?.onWorkspaceCreated(
          { tenantId: tenant.id, workspaceId: workspace.id, createdByUserId: user.id },
          client,
        );

        if (parsed.markEmailVerified) {
          await this.users.markEmailVerified(user.id, client);
        }

        return {
          userId: user.id,
          tenantId: tenant.id,
          workspaceId: workspace.id,
          created: true,
        };
      }

      if (parsed.markEmailVerified) {
        await this.users.markEmailVerified(user.id, client);
      }

      return {
        userId: user.id,
        tenantId: target.tenantId,
        workspaceId: target.workspace.id,
        created: true,
      };
    });
  }

  private async resolveProvisioningTarget(
    input: z.infer<typeof provisionClassicUserSchema>,
    client: Queryable,
  ): Promise<{
    tenantId: string;
    workspace: { id: string; tenant_id: string; created_by_user_id: string | null; deleted_at: Date | null };
    mode: 'explicit-existing' | 'slug-existing' | 'new';
  }> {
    if (input.tenantId && input.workspaceId) {
      const workspace = await this.workspaces.findById(input.workspaceId, client);
      if (!workspace || workspace.deleted_at) {
        throw new ConflictException('Requested workspace does not exist.');
      }

      if (workspace.tenant_id !== input.tenantId) {
        throw new ConflictException('Requested workspace does not belong to the provided tenant.');
      }

      const tenant = await client
        .selectFrom('tenants')
        .select(['id', 'deleted_at'])
        .where('id', '=', input.tenantId)
        .executeTakeFirst();

      if (!tenant || tenant.deleted_at) {
        throw new ConflictException('Requested tenant does not exist.');
      }

      return {
        tenantId: input.tenantId,
        workspace,
        mode: 'explicit-existing',
      };
    }

    const existingWorkspace = await this.workspaces.findBySlug(input.workspaceSlug!, client);
    if (existingWorkspace && !existingWorkspace.deleted_at) {
      return {
        tenantId: existingWorkspace.tenant_id,
        workspace: existingWorkspace,
        mode: 'slug-existing',
      };
    }

    return {
      tenantId: '',
      workspace: {
        id: '',
        tenant_id: '',
        created_by_user_id: null,
        deleted_at: null,
      },
      mode: 'new',
    };
  }

  private async ensureTenantMembership(tenantId: string, userId: string, client: Queryable): Promise<void> {
    await client
      .insertInto('tenant_members')
      .values({
        id: randomUUID(),
        tenant_id: tenantId,
        user_id: userId,
        status: 'active',
      })
      .onConflict((oc: any) =>
        oc.columns(['tenant_id', 'user_id']).doUpdateSet({
          status: 'active',
          deleted_at: null,
        }),
      )
      .execute();
  }

  private assertPasswordPolicy(password: string): void {
    if (password.length < this.configService.config.classic.passwordMinLength) {
      throw new UnprocessableEntityException(
        `Password must be at least ${this.configService.config.classic.passwordMinLength} characters.`,
      );
    }
  }
}
