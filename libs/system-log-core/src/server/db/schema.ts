import type { Generated, ColumnType } from '@ikary/system-db-core';

export interface LogSettingsTable {
  id: Generated<string>;
  tenant_id: string;
  workspace_id: string | null;
  cell_id: string | null;
  scope: 'tenant' | 'workspace' | 'cell';
  log_level: 'verbose' | 'normal' | 'production';
  version: number;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface LogSinksTable {
  id: Generated<string>;
  tenant_id: string;
  workspace_id: string | null;
  cell_id: string | null;
  scope: 'tenant' | 'workspace' | 'cell';
  sink_type: 'ui' | 'persistent' | 'external';
  retention_hours: number;
  config: unknown;
  is_enabled: boolean;
  version: number;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface PlatformLogsTable {
  id: Generated<string>;
  tenant_id: string;
  tenant_slug: string;
  workspace_id: string | null;
  workspace_slug: string | null;
  cell_id: string | null;
  cell_slug: string | null;
  service: string;
  operation: string;
  level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  source: string | null;
  metadata: unknown;
  request_id: string | null;
  trace_id: string | null;
  span_id: string | null;
  correlation_id: string | null;
  actor_id: string | null;
  actor_type: string | null;
  sink_type: 'ui' | 'persistent' | 'external';
  logged_at: Generated<Date>;
  expires_at: ColumnType<Date | null, Date | null, Date | null>;
}

export interface SystemLogDatabaseSchema {
  log_settings: LogSettingsTable;
  log_sinks: LogSinksTable;
  platform_logs: PlatformLogsTable;
}
