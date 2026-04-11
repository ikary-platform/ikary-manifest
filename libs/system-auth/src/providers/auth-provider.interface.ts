import type { AuthContext, LoginResult, SignupResult, WorkspaceSessionResult } from '../common/types';
import type { ProviderName } from '../common/types';

export interface AuthProvider {
  readonly provider: ProviderName;
  signup(input: unknown, context: AuthContext): Promise<SignupResult>;
  login(input: unknown, context: AuthContext): Promise<LoginResult>;
  refresh(input: unknown, context: AuthContext): Promise<WorkspaceSessionResult>;
  selectWorkspace?(input: unknown, context: AuthContext): Promise<WorkspaceSessionResult>;
  switchWorkspace?(input: unknown, context: AuthContext): Promise<WorkspaceSessionResult>;
  forgotPassword(input: unknown, context: AuthContext): Promise<void>;
  resetPassword(input: unknown, context: AuthContext): Promise<void>;
  verifyEmail(input: unknown, context: AuthContext): Promise<void>;
  requestMagicLink?(input: unknown, context: AuthContext): Promise<void>;
  consumeMagicLink?(input: unknown, context: AuthContext): Promise<WorkspaceSessionResult>;
}
