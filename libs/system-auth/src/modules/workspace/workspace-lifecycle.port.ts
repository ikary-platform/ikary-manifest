export interface WorkspaceLifecyclePort {
  onWorkspaceCreated(
    input: { tenantId: string; workspaceId: string; createdByUserId: string },
    client?: unknown,
  ): Promise<void>;
}

export const WORKSPACE_LIFECYCLE_PORT = Symbol('WORKSPACE_LIFECYCLE_PORT');
