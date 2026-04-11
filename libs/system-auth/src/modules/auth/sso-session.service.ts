import { Inject, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { HashService } from '../../common/hash.service';
import { AuthConfigService } from '../../config/auth-config.service';

export interface SsoSessionClaims {
  userId: string;
  tenantId: string;
  workspaceId: string | null;
}

@Injectable()
export class SsoSessionService {
  private readonly TTL_DAYS = 30;

  private readonly exchangeCodes = new Map<string, { userId: string; workspaceId: string; expiresAt: number }>();

  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(HashService) private readonly hashService: HashService,
    @Inject(AuthConfigService) private readonly authConfig: AuthConfigService,
  ) {}

  /**
   * Creates a new SSO session, stores it hashed in the DB, and returns the
   * raw (unhashed) token to be placed in the httpOnly cookie.
   */
  async createSession(params: {
    userId: string;
    tenantId: string;
    workspaceId: string | null;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<string> {
    const rawToken = this.hashService.generateOpaqueToken(32);
    const tokenHash = this.hashService.hashOpaqueToken(rawToken, this.authConfig.config.jwt.tokenHashSecret);
    const expiresAt = new Date(Date.now() + this.TTL_DAYS * 24 * 60 * 60 * 1000);

    await this.db.db
      .insertInto('sso_sessions')
      .values({
        user_id: params.userId,
        tenant_id: params.tenantId,
        workspace_id: params.workspaceId ?? null,
        token_hash: tokenHash,
        ip_address: params.ipAddress ?? null,
        user_agent: params.userAgent ?? null,
        expires_at: expiresAt,
      })
      .execute();

    return rawToken;
  }

  /**
   * Validates the raw SSO token from the cookie.
   * Returns the session claims if valid, null otherwise.
   */
  async validateSession(rawToken: string): Promise<SsoSessionClaims | null> {
    const tokenHash = this.hashService.hashOpaqueToken(rawToken, this.authConfig.config.jwt.tokenHashSecret);

    const row = await this.db.db
      .selectFrom('sso_sessions')
      .select(['user_id', 'tenant_id', 'workspace_id', 'expires_at', 'revoked_at'])
      .where('token_hash', '=', tokenHash)
      .executeTakeFirst();

    if (!row) return null;
    if (row.revoked_at !== null) return null;
    if (row.expires_at < new Date()) return null;

    return {
      userId: row.user_id,
      tenantId: row.tenant_id,
      workspaceId: row.workspace_id,
    };
  }

  /**
   * Creates a short-lived one-time exchange code for cross-domain SSO.
   * The code is stored in memory with a 60-second TTL and must be consumed
   * exactly once via `consumeExchangeCode`.
   */
  createExchangeCode(userId: string, workspaceId: string): string {
    const code = this.hashService.generateOpaqueToken(32);
    const expiresAt = Date.now() + 60_000;
    this.exchangeCodes.set(code, { userId, workspaceId, expiresAt });
    // Lazy GC: purge expired codes on each creation
    for (const [k, v] of this.exchangeCodes) {
      if (v.expiresAt < Date.now()) this.exchangeCodes.delete(k);
    }
    return code;
  }

  /**
   * Consumes a one-time exchange code. Returns the associated claims if valid,
   * null if the code is unknown or expired. Each code can only be consumed once.
   */
  consumeExchangeCode(code: string): { userId: string; workspaceId: string } | null {
    const entry = this.exchangeCodes.get(code);
    if (!entry) return null;
    this.exchangeCodes.delete(code);
    if (entry.expiresAt < Date.now()) return null;
    return { userId: entry.userId, workspaceId: entry.workspaceId };
  }

  /**
   * Revokes a single SSO session by raw token value.
   */
  async revokeSession(rawToken: string): Promise<void> {
    const tokenHash = this.hashService.hashOpaqueToken(rawToken, this.authConfig.config.jwt.tokenHashSecret);

    await this.db.db
      .updateTable('sso_sessions')
      .set({ revoked_at: new Date() })
      .where('token_hash', '=', tokenHash)
      .where('revoked_at', 'is', null)
      .execute();
  }

  /**
   * Revokes all active SSO sessions for a user within a tenant.
   * Called on password reset or account-wide logout.
   */
  async revokeAllUserSessions(userId: string, tenantId: string): Promise<void> {
    await this.db.db
      .updateTable('sso_sessions')
      .set({ revoked_at: new Date() })
      .where('user_id', '=', userId)
      .where('tenant_id', '=', tenantId)
      .where('revoked_at', 'is', null)
      .execute();
  }
}
