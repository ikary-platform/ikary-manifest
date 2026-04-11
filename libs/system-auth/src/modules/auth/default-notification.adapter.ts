import { Inject, Injectable, Optional } from '@nestjs/common';
import type { AuthNotificationPort } from './notification.port';
import { LogService } from '@ikary/system-log-core/server';

@Injectable()
export class DefaultNotificationAdapter implements AuthNotificationPort {
  constructor(@Optional() @Inject(LogService) private readonly logger: LogService | null) {}

  async sendEmailVerification(input: {
    email: string;
    workspaceId: string;
    strategy: 'code' | 'click';
    code?: string;
    token?: string;
    expiresAt: Date;
  }): Promise<void> {
    this.logger?.debug('Email verification dispatched', {
      operation: 'auth.notification.sendVerification',
      metadata: { email: input.email, workspaceId: input.workspaceId, strategy: input.strategy },
    });
  }

  async sendPasswordReset(input: {
    email: string;
    workspaceId: string;
    token: string;
    expiresAt: Date;
  }): Promise<void> {
    this.logger?.debug('Password reset dispatched', {
      operation: 'auth.notification.sendPasswordReset',
      metadata: { email: input.email, workspaceId: input.workspaceId },
    });
  }

  async sendMagicLink(input: { email: string; workspaceId: string; token: string; expiresAt: Date }): Promise<void> {
    this.logger?.debug('Magic link dispatched', {
      operation: 'auth.notification.sendMagicLink',
      metadata: { email: input.email, workspaceId: input.workspaceId },
    });
  }

  async sendWorkspaceInvitation(input: {
    email: string;
    tenantId: string;
    workspaceId: string;
    invitedRole: string;
    token: string;
    expiresAt: Date;
  }): Promise<void> {
    this.logger?.debug('Workspace invitation dispatched', {
      operation: 'auth.notification.sendWorkspaceInvitation',
      metadata: { email: input.email, workspaceId: input.workspaceId, invitedRole: input.invitedRole },
    });
  }

  async sendSignupInvitation(input: { email: string; code: string; expiresAt: Date }): Promise<void> {
    this.logger?.debug('Signup OTP dispatched', {
      operation: 'auth.notification.sendSignupInvitation',
      metadata: { email: input.email },
    });
  }

  async sendPasswordChanged(input: { email: string }): Promise<void> {
    this.logger?.debug('Password changed notification dispatched', {
      operation: 'auth.notification.sendPasswordChanged',
      metadata: { email: input.email },
    });
  }
}
