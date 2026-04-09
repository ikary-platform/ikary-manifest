// Internal server-side types only — not exported from the package root.
import type { KyselyDatabaseProvider } from '@ikary/system-db-core';
import type { SystemLogDatabaseSchema } from './db/schema';
import type { LogEntryLevel } from '../shared/log-level.schema';

export type SystemLogDatabase = KyselyDatabaseProvider<SystemLogDatabaseSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SystemLogProviderToken = string | symbol | (abstract new (...args: any[]) => any);

export interface LogEntry {
  tenantId: string;
  tenantSlug: string;
  workspaceId?: string | null;
  workspaceSlug?: string | null;
  cellId?: string | null;
  cellSlug?: string | null;
  service: string;
  operation: string;
  level: LogEntryLevel;
  message: string;
  source?: string | null;
  metadata?: Record<string, unknown> | null;
  requestId?: string | null;
  traceId?: string | null;
  spanId?: string | null;
  correlationId?: string | null;
  actorId?: string | null;
  actorType?: string | null;
}
