import { Inject, Injectable } from '@nestjs/common';
import type { Queryable } from '@ikary/system-db-core';
import { DatabaseService } from '../../database/database.service';
import { HashService } from '../../common/hash.service';
import { AuthConfigService } from '../../config/auth-config.service';
import type { AuthDatabaseSchema } from '../../database/schema';

@Injectable()
export class OAuthRepository {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(HashService) private readonly hashService: HashService,
    @Inject(AuthConfigService) private readonly configService: AuthConfigService,
  ) {}

  private executor(client?: Queryable<AuthDatabaseSchema>) {
    return client ?? this.db.db;
  }

  async createStateToken(input: {
    state: string;
    provider: 'github' | 'google';
    redirectUri?: string;
    codeVerifier?: string;
    metadata?: unknown;
  }): Promise<void> {
    const stateHash = this.hashService.hashOpaqueToken(input.state, this.configService.config.jwt.tokenHashSecret);
    const expiresAt = new Date(Date.now() + 10 * 60_000); // 10 minutes

    await this.db.db
      .insertInto('oauth_state_tokens')
      .values({
        state_hash: stateHash,
        provider: input.provider,
        redirect_uri: input.redirectUri ?? null,
        code_verifier: input.codeVerifier ?? null,
        metadata: input.metadata ?? null,
        expires_at: expiresAt,
      })
      .execute();
  }

  async findActiveStateToken(
    state: string,
    provider: 'github' | 'google',
  ): Promise<{
    id: string;
    provider: 'github' | 'google';
    redirect_uri: string | null;
    code_verifier: string | null;
    metadata: unknown;
    expires_at: Date;
    consumed_at: Date | null;
  } | null> {
    const stateHash = this.hashService.hashOpaqueToken(state, this.configService.config.jwt.tokenHashSecret);

    return (
      (await this.db.db
        .selectFrom('oauth_state_tokens')
        .select(['id', 'provider', 'redirect_uri', 'code_verifier', 'metadata', 'expires_at', 'consumed_at'])
        .where('state_hash', '=', stateHash)
        .where('provider', '=', provider)
        .where('consumed_at', 'is', null)
        .where('expires_at', '>', this.db.now())
        .executeTakeFirst()) ?? null
    );
  }

  async consumeStateToken(id: string): Promise<void> {
    await this.db.db.updateTable('oauth_state_tokens').set({ consumed_at: this.db.now() }).where('id', '=', id).execute();
  }

  async findOAuthAccount(
    provider: 'github' | 'google',
    providerUserId: string,
    client?: Queryable<AuthDatabaseSchema>,
  ): Promise<{
    id: string;
    user_id: string;
    provider: 'github' | 'google';
    provider_user_id: string;
    provider_email: string | null;
    provider_display_name: string | null;
    provider_avatar_url: string | null;
  } | null> {
    return (
      (await this.executor(client)
        .selectFrom('user_oauth_accounts')
        .select([
          'id',
          'user_id',
          'provider',
          'provider_user_id',
          'provider_email',
          'provider_display_name',
          'provider_avatar_url',
        ])
        .where('provider', '=', provider)
        .where('provider_user_id', '=', providerUserId)
        .executeTakeFirst()) ?? null
    );
  }

  async createOAuthAccount(
    input: {
      userId: string;
      provider: 'github' | 'google';
      providerUserId: string;
      providerEmail?: string;
      providerDisplayName?: string;
      providerAvatarUrl?: string;
    },
    client?: Queryable<AuthDatabaseSchema>,
  ): Promise<void> {
    await this.executor(client)
      .insertInto('user_oauth_accounts')
      .values({
        user_id: input.userId,
        provider: input.provider,
        provider_user_id: input.providerUserId,
        provider_email: input.providerEmail ?? null,
        provider_display_name: input.providerDisplayName ?? null,
        provider_avatar_url: input.providerAvatarUrl ?? null,
      })
      .execute();
  }

  async findOAuthAccountsByUserId(
    userId: string,
    client?: Queryable<AuthDatabaseSchema>,
  ): Promise<
    Array<{
      id: string;
      provider: 'github' | 'google';
      provider_user_id: string;
      provider_email: string | null;
    }>
  > {
    return this.executor(client)
      .selectFrom('user_oauth_accounts')
      .select(['id', 'provider', 'provider_user_id', 'provider_email'])
      .where('user_id', '=', userId)
      .execute();
  }
}
