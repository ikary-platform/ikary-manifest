import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { AuthConfigService } from '../../config/auth-config.service';

interface BasePayload {
  user_id: string;
  tenant_id: string;
  workspace_id: string;
  is_system_admin: boolean;
  type: 'access' | 'refresh';
}

interface WorkspaceSelectionPayload {
  user_id: string;
  type: 'workspace_selection';
}

export interface AccessTokenPayload extends BasePayload {
  type: 'access';
}

export interface RefreshTokenPayload extends BasePayload {
  type: 'refresh';
  jti: string;
}

export interface WorkspaceSelectionTokenPayload extends WorkspaceSelectionPayload {}

@Injectable()
export class TokenService {
  constructor(@Inject(AuthConfigService) private readonly config: AuthConfigService) {}

  createTokenPair(input: { userId: string; tenantId: string; workspaceId: string; isSystemAdmin: boolean }) {
    const { jwt } = this.config.config;
    const now = Date.now();
    const accessTokenExpiresAt = new Date(now + jwt.accessTokenTtlSeconds * 1000);
    const refreshTokenExpiresAt = new Date(now + jwt.refreshTokenTtlSeconds * 1000);
    const refreshJti = uuidv4();

    const accessToken = sign(
      {
        user_id: input.userId,
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId,
        is_system_admin: input.isSystemAdmin,
        type: 'access',
      },
      jwt.accessTokenSecret,
      {
        expiresIn: jwt.accessTokenTtlSeconds,
        issuer: jwt.issuer,
        audience: jwt.audience,
      },
    );

    const refreshToken = sign(
      {
        user_id: input.userId,
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId,
        is_system_admin: input.isSystemAdmin,
        type: 'refresh',
        jti: refreshJti,
      },
      jwt.refreshTokenSecret,
      {
        expiresIn: jwt.refreshTokenTtlSeconds,
        issuer: jwt.issuer,
        audience: jwt.audience,
      },
    );

    return {
      accessToken,
      refreshToken,
      refreshJti,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
    };
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    const { jwt } = this.config.config;

    try {
      const payload = verify(token, jwt.accessTokenSecret, {
        issuer: jwt.issuer,
        audience: jwt.audience,
      }) as Partial<AccessTokenPayload>;

      if (
        payload.type !== 'access' ||
        !payload.user_id ||
        !payload.tenant_id ||
        !payload.workspace_id ||
        typeof payload.is_system_admin !== 'boolean'
      ) {
        throw new UnauthorizedException('Invalid access token.');
      }

      return payload as AccessTokenPayload;
    } catch {
      throw new UnauthorizedException('Access token is invalid or expired.');
    }
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    const { jwt } = this.config.config;

    try {
      const payload = verify(token, jwt.refreshTokenSecret, {
        issuer: jwt.issuer,
        audience: jwt.audience,
      }) as Partial<RefreshTokenPayload>;

      if (
        payload.type !== 'refresh' ||
        !payload.jti ||
        !payload.user_id ||
        !payload.tenant_id ||
        !payload.workspace_id ||
        typeof payload.is_system_admin !== 'boolean'
      ) {
        throw new UnauthorizedException('Invalid refresh token.');
      }

      return payload as RefreshTokenPayload;
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired.');
    }
  }

  createWorkspaceSelectionToken(input: { userId: string; expiresInSeconds?: number }): string {
    const { jwt } = this.config.config;
    const expiresIn = input.expiresInSeconds ?? 300;

    return sign(
      {
        user_id: input.userId,
        type: 'workspace_selection',
      },
      jwt.accessTokenSecret,
      {
        expiresIn,
        issuer: jwt.issuer,
        audience: jwt.audience,
      },
    );
  }

  verifyWorkspaceSelectionToken(token: string): WorkspaceSelectionTokenPayload {
    const { jwt } = this.config.config;

    try {
      const payload = verify(token, jwt.accessTokenSecret, {
        issuer: jwt.issuer,
        audience: jwt.audience,
      }) as Partial<WorkspaceSelectionTokenPayload>;

      if (payload.type !== 'workspace_selection' || !payload.user_id) {
        throw new UnauthorizedException('Invalid workspace selection token.');
      }

      return payload as WorkspaceSelectionTokenPayload;
    } catch {
      throw new UnauthorizedException('Workspace selection token is invalid or expired.');
    }
  }
}
