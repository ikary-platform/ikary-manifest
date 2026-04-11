import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import { AuthProvisioningService, TokenService, type ProvisionClassicUserResult } from '@ikary/system-auth';
import { LogService } from '@ikary/system-log-core/server';

@Injectable()
export class PreviewBootstrapService implements OnModuleInit {
  private previewToken: string | null = null;
  private previewUser: ProvisionClassicUserResult | null = null;

  constructor(
    @Inject(AuthProvisioningService) private readonly provisioning: AuthProvisioningService,
    @Inject(TokenService) private readonly tokenService: TokenService,
    @Inject(LogService) private readonly logger: LogService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      this.previewUser = await this.provisioning.provisionClassicUser({
        email: 'admin@ikary.local',
        password: 'preview',
        workspaceName: 'Preview',
        workspaceSlug: 'preview',
        markEmailVerified: true,
      });

      const tokens = this.tokenService.createTokenPair({
        userId: this.previewUser.userId,
        tenantId: this.previewUser.tenantId,
        workspaceId: this.previewUser.workspaceId,
        isSystemAdmin: false,
      });

      this.previewToken = tokens.accessToken;

      this.logger.log('Preview user bootstrapped', {
        operation: 'preview.bootstrap',
        actorId: this.previewUser.userId,
        metadata: {
          workspaceId: this.previewUser.workspaceId,
          created: this.previewUser.created,
        },
      });
    } catch (err) {
      this.logger.error('Preview bootstrap failed — auth endpoints will be unavailable', {
        operation: 'preview.bootstrap',
        metadata: { error: err instanceof Error ? err.message : String(err) },
      });
      // Don't rethrow — the server should still start so that health checks
      // and unauthenticated endpoints remain available.  Preview token will be
      // null and GET /auth/preview-token will return 503.
    }
  }

  getToken(): string | null {
    return this.previewToken;
  }

  getUser(): ProvisionClassicUserResult | null {
    return this.previewUser;
  }
}
