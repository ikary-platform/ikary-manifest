export interface AuditLogCreateInput {
  workspaceId: string;
  actorUserId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  httpMethod?: string;
  requestPath?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  statusCode?: number;
  metadata?: Record<string, unknown>;
}
