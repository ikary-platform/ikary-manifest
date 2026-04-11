export interface AuthNotificationPort {
  sendEmailVerification(input: {
    email: string;
    workspaceId: string;
    strategy: 'code' | 'click';
    code?: string;
    token?: string;
    expiresAt: Date;
  }): Promise<void>;

  sendPasswordReset(input: { email: string; workspaceId: string; token: string; expiresAt: Date }): Promise<void>;

  sendMagicLink(input: { email: string; workspaceId: string; token: string; expiresAt: Date }): Promise<void>;

  sendWorkspaceInvitation(input: {
    email: string;
    tenantId: string;
    workspaceId: string;
    invitedRole: string;
    token: string;
    expiresAt: Date;
  }): Promise<void>;

  sendSignupInvitation(input: { email: string; code: string; expiresAt: Date }): Promise<void>;

  sendPasswordChanged(input: { email: string }): Promise<void>;
}
