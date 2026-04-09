# @ikary/system-log-core

Structured logging for IKARY services. Pino-backed, DB-persisted, with cascading level settings, configurable sinks, and a React terminal viewer.

## Export Surface

| Import path | Contents | Used by |
|---|---|---|
| `@ikary/system-log-core` | Shared Zod schemas and types (browser-safe) | Any consumer |
| `@ikary/system-log-core/server` | NestJS module, services, repositories | NestJS apps |
| `@ikary/system-log-core/ui` | React components, hooks | Browser apps |

## Installation

```bash
pnpm add @ikary/system-log-core
```

## NestJS Integration

```typescript
// app.module.ts
import { SystemLogModule } from '@ikary/system-log-core/server';

@Module({
  imports: [
    SystemLogModule.register({
      databaseProviderToken: DatabaseService,
      service: 'my-service',
      pretty: process.env.NODE_ENV !== 'production',
    }),
  ],
})
export class AppModule {}
```

Then inject `LogService` anywhere:

```typescript
import { LogService } from '@ikary/system-log-core/server';

@Injectable()
export class MyService {
  constructor(private readonly log: LogService) {}

  async doSomething() {
    this.log.log('Starting operation', { operation: 'my.operation', actorId: '...' });
  }
}
```

Bootstrap NestJS to use it as the application logger:

```typescript
// main.ts
const logger = app.get(LogService);
app.useLogger(logger);
```

## Sinks

| Type | Behaviour |
|---|---|
| `persistent` | Writes to `platform_logs` with TTL (`retention_hours`) |
| `ui` | Same as persistent — exposed via the log viewer API |
| `external` | Fire-and-forget HTTP POST to a configured `endpoint` |

A `persistent` sink with 72h retention is seeded automatically on first boot (disable with `seedDefaultSink: false`).

## Log Levels

Setting the log level controls which entries are stored. `normal` (default) captures `info` and above; `verbose` captures everything; `production` captures only `error` and `fatal`.

## Migrations

Run the SQL files in order before starting the service:

```
migrations/v1.0.0/001_system_log_core_settings_create.sql
migrations/v1.0.0/002_system_log_core_sinks_create.sql
migrations/v1.0.0/003_system_log_core_entries_create.sql
migrations/v1.1.0/001_system_log_core_entries_add_search_index.sql  (PostgreSQL pg_trgm, optional)
```

## React Log Viewer

```tsx
import { TerminalLogViewer } from '@ikary/system-log-core/ui';

<TerminalLogViewer
  fetchLogs={async (params) => {
    const res = await fetch(`/api/logs?${new URLSearchParams(params as Record<string, string>)}`);
    return res.json();
  }}
/>
```
