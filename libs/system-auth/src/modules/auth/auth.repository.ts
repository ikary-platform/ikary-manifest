import { Inject, Injectable } from '@nestjs/common';
import type { Queryable } from '@ikary/system-db-core';
import { DatabaseService } from '../../database/database.service';
import type { AuthDatabaseSchema } from '../../database/schema';

interface RefreshTokenRecord {
  id: string;
  jti: string;
  tenant_id: string;
  workspace_id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
}

interface TokenRecord {
  id: string;
  workspace_id: string;
  user_id: string;
  token_hash: string | null;
  code_hash?: string | null;
  expires_at: Date;
  consumed_at: Date | null;
}

@Injectable()
export class AuthRepository {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  private executor(client?: Queryable<AuthDatabaseSchema>) {
    return client ?? this.db.db;
  }

  async storeRefreshToken(
    input: {
      jti: string;
      tenantId: string;
      workspaceId: string;
      userId: string;
      tokenHash: string;
      expiresAt: Date;
      ipAddress?: string;
      userAgent?: string;
    },
    client?: Queryable<AuthDatabaseSchema>,
  ): Promise<void> {
    await this.executor(client)
      .insertInto('refresh_tokens')
      .values({
        jti: input.jti,
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId,
        user_id: input.userId,
        token_hash: input.tokenHash,
        expires_at: input.expiresAt,
        ip_address: input.ipAddress ?? null,
        user_agent: input.userAgent ?? null,
      })
      .execute();
  }

  async findActiveRefreshToken(
    input: { jti: string; tenantId: string; workspaceId: string; userId: string },
    client?: Queryable<AuthDatabaseSchema>,
  ): Promise<RefreshTokenRecord | null> {
    return (
      (await this.executor(client)
        .selectFrom('refresh_tokens')
        .select(['id', 'jti', 'tenant_id', 'workspace_id', 'user_id', 'token_hash', 'expires_at', 'revoked_at'])
        .where('jti', '=', input.jti)
        .where('tenant_id', '=', input.tenantId)
        .where('workspace_id', '=', input.workspaceId)
        .where('user_id', '=', input.userId)
        .executeTakeFirst()) ?? null
    );
  }

  async revokeRefreshToken(
    input: { tokenId: string; replacedByJti?: string },
    client?: Queryable<AuthDatabaseSchema>,
  ): Promise<void> {
    await this.executor(client)
      .updateTable('refresh_tokens')
      .set({
        revoked_at: this.db.now(),
        replaced_by_jti: input.replacedByJti ?? null,
      })
      .where('id', '=', input.tokenId)
      .execute();
  }

  async revokeUserRefreshTokens(
    input: { tenantId: string; workspaceId: string; userId: string },
    client?: Queryable<AuthDatabaseSchema>,
  ): Promise<void> {
    await this.executor(client)
      .updateTable('refresh_tokens')
      .set({ revoked_at: this.db.now() })
      .where('tenant_id', '=', input.tenantId)
      .where('workspace_id', '=', input.workspaceId)
      .where('user_id', '=', input.userId)
      .where('revoked_at', 'is', null)
      .execute();
  }

  async invalidateEmailVerificationTokens(
    input: { workspaceId: string; userId: string },
    client?: Queryable<AuthDatabaseSchema>,
  ): Promise<void> {
    await this.executor(client)
      .updateTable('email_verification_tokens')
      .set({ consumed_at: this.db.now() })
      .where('workspace_id', '=', input.workspaceId)
      .where('user_id', '=', input.userId)
      .where('consumed_at', 'is', null)
      .execute();
  }

  async createEmailVerificationToken(
    input: {
      tenantId: string;
      workspaceId: string;
      userId: string;
      strategy: 'code' | 'click';
      codeHash?: string;
      tokenHash?: string;
      expiresAt: Date;
    },
    client?: Queryable<AuthDatabaseSchema>,
  ): Promise<void> {
    await this.executor(client)
      .insertInto('email_verification_tokens')
      .values({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId,
        user_id: input.userId,
        strategy: input.strategy,
        code_hash: input.codeHash ?? null,
        token_hash: input.tokenHash ?? null,
        expires_at: input.expiresAt,
      })
      .execute();
  }

  async findActiveEmailVerificationTokenByHash(
    input: {
      workspaceId: string;
      userId: string;
      strategy: 'code' | 'click';
      codeHash?: string;
      tokenHash?: string;
    },
    client?: Queryable<AuthDatabaseSchema>,
  ): Promise<TokenRecord | null> {
    let query = this.executor(client)
      .selectFrom('email_verification_tokens')
      .select(['id', 'workspace_id', 'user_id', 'token_hash', 'code_hash', 'expires_at', 'consumed_at'])
      .where('workspace_id', '=', input.workspaceId)
      .where('user_id', '=', input.userId)
      .where('strategy', '=', input.strategy)
      .where('consumed_at', 'is', null);

    if (input.codeHash) {
      query = query.where('code_hash', '=', input.codeHash);
    }

    if (input.tokenHash) {
      query = query.where('token_hash', '=', input.tokenHash);
    }

    return (await query.orderBy('created_at', 'desc').executeTakeFirst()) ?? null;
  }

  async consumeEmailVerificationToken(tokenId: string, client?: Queryable<AuthDatabaseSchema>): Promise<void> {
    await this.executor(client)
      .updateTable('email_verification_tokens')
      .set({ consumed_at: this.db.now() })
      .where('id', '=', tokenId)
      .execute();
  }

  async invalidatePasswordResetTokens(
    input: { workspaceId: string; userId: string },
    client?: Queryable<AuthDatabaseSchema>,
  ): Promise<void> {
    await this.executor(client)
      .updateTable('password_reset_tokens')
      .set({ consumed_at: this.db.now() })
      .where('workspace_id', '=', input.workspaceId)
      .where('user_id', '=', input.userId)
      .where('consumed_at', 'is', null)
      .execute();
  }

  async createPasswordResetToken(
    input: {
      tenantId: string;
      workspaceId: string;
      userId: string;
      tokenHash: string;
      expiresAt: Date;
    },
    client?: Queryable<AuthDatabaseSchema>,
  ): Promise<void> {
    await this.executor(client)
      .insertInto('password_reset_tokens')
      .values({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId,
        user_id: input.userId,
        token_hash: input.tokenHash,
        expires_at: input.expiresAt,
      })
      .execute();
  }

  async findActivePasswordResetTokenByHash(
    input: { workspaceId?: string; tokenHash: string },
    client?: Queryable<AuthDatabaseSchema>,
  ): Promise<TokenRecord | null> {
    let query = this.executor(client)
      .selectFrom('password_reset_tokens')
      .select(['id', 'workspace_id', 'user_id', 'token_hash', 'expires_at', 'consumed_at'])
      .where('token_hash', '=', input.tokenHash)
      .where('consumed_at', 'is', null);

    if (input.workspaceId) {
      query = query.where('workspace_id', '=', input.workspaceId);
    }

    return (await query.orderBy('created_at', 'desc').executeTakeFirst()) ?? null;
  }

  async consumePasswordResetToken(tokenId: string, client?: Queryable<AuthDatabaseSchema>): Promise<void> {
    await this.executor(client)
      .updateTable('password_reset_tokens')
      .set({ consumed_at: this.db.now() })
      .where('id', '=', tokenId)
      .execute();
  }

  async invalidateMagicLinkTokens(
    input: { workspaceId: string; userId: string },
    client?: Queryable<AuthDatabaseSchema>,
  ): Promise<void> {
    await this.executor(client)
      .updateTable('magic_link_tokens')
      .set({ consumed_at: this.db.now() })
      .where('workspace_id', '=', input.workspaceId)
      .where('user_id', '=', input.userId)
      .where('consumed_at', 'is', null)
      .execute();
  }

  async createMagicLinkToken(
    input: {
      tenantId: string;
      workspaceId: string;
      userId: string;
      tokenHash: string;
      expiresAt: Date;
    },
    client?: Queryable<AuthDatabaseSchema>,
  ): Promise<void> {
    await this.executor(client)
      .insertInto('magic_link_tokens')
      .values({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId,
        user_id: input.userId,
        token_hash: input.tokenHash,
        expires_at: input.expiresAt,
      })
      .execute();
  }

  async findActiveMagicLinkTokenByHash(
    input: { workspaceId: string; tokenHash: string },
    client?: Queryable<AuthDatabaseSchema>,
  ): Promise<TokenRecord | null> {
    return (
      (await this.executor(client)
        .selectFrom('magic_link_tokens')
        .select(['id', 'workspace_id', 'user_id', 'token_hash', 'code_hash', 'expires_at', 'consumed_at'])
        .where('workspace_id', '=', input.workspaceId)
        .where('token_hash', '=', input.tokenHash)
        .where('consumed_at', 'is', null)
        .orderBy('created_at', 'desc')
        .executeTakeFirst()) ?? null
    );
  }

  async consumeMagicLinkToken(tokenId: string, client?: Queryable<AuthDatabaseSchema>): Promise<void> {
    await this.executor(client)
      .updateTable('magic_link_tokens')
      .set({ consumed_at: this.db.now() })
      .where('id', '=', tokenId)
      .execute();
  }
}
