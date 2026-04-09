import { describe, it, expect } from 'vitest';
import { correlationContextSchema } from './correlation.schema.js';
import { logContextSchema } from './log-context.schema.js';
import { platformLogEntrySchema } from './log-entry.schema.js';
import { logLevelSchema, logEntryLevelSchema, LOG_LEVELS, LOG_ENTRY_LEVELS } from './log-level.schema.js';
import { logSettingsSchema, updateLogSettingsSchema } from './log-settings.schema.js';
import {
  uiSinkConfigSchema,
  persistentSinkConfigSchema,
  externalSinkConfigSchema,
  logSinkSchema,
  createLogSinkSchema,
  updateLogSinkSchema,
} from './log-sink.schema.js';

const UUID = '00000000-0000-0000-0000-000000000001';
const ISO = '2026-01-01T00:00:00.000Z';

// ── correlationContextSchema ──────────────────────────────────────────────────

describe('correlationContextSchema', () => {
  it('accepts empty object', () => {
    expect(() => correlationContextSchema.parse({})).not.toThrow();
  });

  it('accepts all optional fields', () => {
    const r = correlationContextSchema.parse({ correlationId: UUID, requestId: UUID, traceId: 'trace-1' });
    expect(r.correlationId).toBe(UUID);
    expect(r.requestId).toBe(UUID);
    expect(r.traceId).toBe('trace-1');
  });

  it('rejects non-UUID correlationId', () => {
    expect(() => correlationContextSchema.parse({ correlationId: 'not-a-uuid' })).toThrow();
  });

  it('allows null values for nullish fields', () => {
    const r = correlationContextSchema.parse({ correlationId: null, requestId: null, traceId: null });
    expect(r.correlationId).toBeNull();
  });
});

// ── logContextSchema ──────────────────────────────────────────────────────────

describe('logContextSchema', () => {
  it('requires operation', () => {
    expect(() => logContextSchema.parse({})).toThrow();
  });

  it('rejects empty operation', () => {
    expect(() => logContextSchema.parse({ operation: '' })).toThrow();
  });

  it('accepts minimal valid context', () => {
    const r = logContextSchema.parse({ operation: 'entity.create' });
    expect(r.operation).toBe('entity.create');
  });

  it('accepts all optional fields', () => {
    const r = logContextSchema.parse({
      operation: 'entity.create',
      tenantId: UUID,
      workspaceId: UUID,
      cellId: UUID,
      actorId: UUID,
      actorType: 'user',
      entityId: 'e1',
      eventType: 'created',
      duration: 42,
      errorCode: 'NOT_FOUND',
      correlationId: UUID,
      metadata: { key: 'val' },
    });
    expect(r.duration).toBe(42);
    expect(r.metadata).toEqual({ key: 'val' });
  });

  it('rejects negative duration', () => {
    expect(() => logContextSchema.parse({ operation: 'x', duration: -1 })).toThrow();
  });

  it('rejects non-UUID tenantId', () => {
    expect(() => logContextSchema.parse({ operation: 'x', tenantId: 'bad' })).toThrow();
  });

  it('accepts null for nullable uuid fields', () => {
    const r = logContextSchema.parse({ operation: 'x', workspaceId: null, cellId: null });
    expect(r.workspaceId).toBeNull();
  });
});

// ── platformLogEntrySchema ────────────────────────────────────────────────────

describe('platformLogEntrySchema', () => {
  const valid = {
    id: UUID,
    tenantId: UUID,
    tenantSlug: 'acme',
    service: 'api',
    operation: 'entity.create',
    level: 'info' as const,
    message: 'hello',
    sinkType: 'persistent' as const,
    loggedAt: ISO,
  };

  it('accepts minimal valid entry', () => {
    expect(() => platformLogEntrySchema.parse(valid)).not.toThrow();
  });

  it('rejects invalid level', () => {
    expect(() => platformLogEntrySchema.parse({ ...valid, level: 'verbose' })).toThrow();
  });

  it('rejects invalid sinkType', () => {
    expect(() => platformLogEntrySchema.parse({ ...valid, sinkType: 'unknown' })).toThrow();
  });

  it('accepts optional nullable fields', () => {
    const r = platformLogEntrySchema.parse({
      ...valid,
      workspaceId: UUID,
      workspaceSlug: 'ws1',
      cellId: UUID,
      cellSlug: 'c1',
      source: 'EntityController',
      metadata: { k: 1 },
      requestId: UUID,
      traceId: 'trace',
      spanId: 'span',
      correlationId: UUID,
      actorId: UUID,
      actorType: 'user',
      expiresAt: ISO,
    });
    expect(r.workspaceId).toBe(UUID);
    expect(r.metadata).toEqual({ k: 1 });
  });

  it('rejects missing required field', () => {
    const { id: _id, ...rest } = valid;
    expect(() => platformLogEntrySchema.parse(rest)).toThrow();
  });
});

// ── logLevelSchema / logEntryLevelSchema ──────────────────────────────────────

describe('logLevelSchema', () => {
  it.each(['verbose', 'normal', 'production'])('accepts %s', (level) => {
    expect(() => logLevelSchema.parse(level)).not.toThrow();
  });

  it('rejects unknown level', () => {
    expect(() => logLevelSchema.parse('debug')).toThrow();
  });

  it('LOG_LEVELS contains all options', () => {
    expect(LOG_LEVELS).toEqual(['verbose', 'normal', 'production']);
  });
});

describe('logEntryLevelSchema', () => {
  it.each(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])('accepts %s', (level) => {
    expect(() => logEntryLevelSchema.parse(level)).not.toThrow();
  });

  it('rejects unknown level', () => {
    expect(() => logEntryLevelSchema.parse('verbose')).toThrow();
  });

  it('LOG_ENTRY_LEVELS contains all options', () => {
    expect(LOG_ENTRY_LEVELS).toEqual(['trace', 'debug', 'info', 'warn', 'error', 'fatal']);
  });
});

// ── logSettingsSchema ─────────────────────────────────────────────────────────

describe('logSettingsSchema', () => {
  const valid = {
    id: UUID,
    tenantId: UUID,
    scope: 'tenant' as const,
    logLevel: 'normal' as const,
    version: 1,
    createdAt: ISO,
    updatedAt: ISO,
  };

  it('accepts valid settings', () => {
    expect(() => logSettingsSchema.parse(valid)).not.toThrow();
  });

  it('accepts optional nullable fields', () => {
    const r = logSettingsSchema.parse({ ...valid, workspaceId: UUID, cellId: null });
    expect(r.workspaceId).toBe(UUID);
    expect(r.cellId).toBeNull();
  });

  it('rejects invalid scope', () => {
    expect(() => logSettingsSchema.parse({ ...valid, scope: 'global' })).toThrow();
  });
});

describe('updateLogSettingsSchema', () => {
  it('accepts valid update', () => {
    const r = updateLogSettingsSchema.parse({ logLevel: 'verbose', expectedVersion: 1 });
    expect(r.logLevel).toBe('verbose');
  });

  it('allows expectedVersion=0 (for creation)', () => {
    expect(() => updateLogSettingsSchema.parse({ logLevel: 'normal', expectedVersion: 0 })).not.toThrow();
  });

  it('rejects negative expectedVersion', () => {
    expect(() => updateLogSettingsSchema.parse({ logLevel: 'normal', expectedVersion: -1 })).toThrow();
  });
});

// ── log-sink schemas ──────────────────────────────────────────────────────────

describe('uiSinkConfigSchema', () => {
  it('accepts empty object', () => {
    expect(uiSinkConfigSchema.parse({})).toEqual({});
  });
});

describe('persistentSinkConfigSchema', () => {
  it('accepts empty object', () => {
    expect(persistentSinkConfigSchema.parse({})).toEqual({});
  });
});

describe('externalSinkConfigSchema', () => {
  it('requires valid endpoint URL', () => {
    expect(() => externalSinkConfigSchema.parse({})).toThrow();
    expect(() => externalSinkConfigSchema.parse({ endpoint: 'not-a-url' })).toThrow();
  });

  it('accepts valid endpoint and applies default timeoutMs', () => {
    const r = externalSinkConfigSchema.parse({ endpoint: 'https://logs.example.com' });
    expect(r.endpoint).toBe('https://logs.example.com');
    expect(r.timeoutMs).toBe(5000);
  });

  it('accepts optional headers and explicit timeout', () => {
    const r = externalSinkConfigSchema.parse({
      endpoint: 'https://logs.example.com',
      headers: { Authorization: 'Bearer token' },
      timeoutMs: 3000,
    });
    expect(r.headers).toEqual({ Authorization: 'Bearer token' });
    expect(r.timeoutMs).toBe(3000);
  });

  it('rejects non-positive timeout', () => {
    expect(() => externalSinkConfigSchema.parse({ endpoint: 'https://x.com', timeoutMs: 0 })).toThrow();
    expect(() => externalSinkConfigSchema.parse({ endpoint: 'https://x.com', timeoutMs: -1 })).toThrow();
  });
});

describe('logSinkSchema', () => {
  const valid = {
    id: UUID,
    tenantId: UUID,
    scope: 'tenant' as const,
    sinkType: 'persistent' as const,
    retentionHours: 72,
    config: {},
    isEnabled: true,
    version: 1,
    createdAt: ISO,
    updatedAt: ISO,
  };

  it('accepts valid sink', () => {
    expect(() => logSinkSchema.parse(valid)).not.toThrow();
  });

  it('accepts optional workspace/cell fields', () => {
    const r = logSinkSchema.parse({ ...valid, workspaceId: UUID, cellId: null });
    expect(r.workspaceId).toBe(UUID);
  });
});

describe('createLogSinkSchema', () => {
  it('accepts ui sink', () => {
    const r = createLogSinkSchema.parse({ sinkType: 'ui', scope: 'tenant', retentionHours: 24 });
    expect(r.sinkType).toBe('ui');
    expect(r.config).toEqual({});
  });

  it('accepts persistent sink', () => {
    const r = createLogSinkSchema.parse({ sinkType: 'persistent', scope: 'workspace', retentionHours: 72 });
    expect(r.sinkType).toBe('persistent');
  });

  it('accepts external sink with config', () => {
    const r = createLogSinkSchema.parse({
      sinkType: 'external',
      scope: 'tenant',
      retentionHours: 24,
      config: { endpoint: 'https://logs.example.com' },
    });
    expect(r.sinkType).toBe('external');
    expect(r.config.timeoutMs).toBe(5000);
  });

  it('accepts optional workspaceId/cellId', () => {
    const r = createLogSinkSchema.parse({
      sinkType: 'ui',
      scope: 'workspace',
      retentionHours: 24,
      workspaceId: UUID,
      cellId: UUID,
    });
    expect(r.workspaceId).toBe(UUID);
    expect(r.cellId).toBe(UUID);
  });

  it('rejects unknown sinkType', () => {
    expect(() => createLogSinkSchema.parse({ sinkType: 'kafka', scope: 'tenant', retentionHours: 24 })).toThrow();
  });

  it('rejects external sink without valid endpoint', () => {
    expect(() =>
      createLogSinkSchema.parse({ sinkType: 'external', scope: 'tenant', retentionHours: 24, config: {} }),
    ).toThrow();
  });
});

describe('updateLogSinkSchema', () => {
  it('accepts partial update with expectedVersion', () => {
    const r = updateLogSinkSchema.parse({ expectedVersion: 2, isEnabled: false });
    expect(r.isEnabled).toBe(false);
  });

  it('rejects expectedVersion < 1', () => {
    expect(() => updateLogSinkSchema.parse({ expectedVersion: 0 })).toThrow();
  });

  it('accepts all optional fields', () => {
    const r = updateLogSinkSchema.parse({
      retentionHours: 48,
      config: { endpoint: 'https://x.com' },
      isEnabled: true,
      expectedVersion: 1,
    });
    expect(r.retentionHours).toBe(48);
  });
});
