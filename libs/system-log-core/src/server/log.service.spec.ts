import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LogService } from './log.service.js';
import { SERVICE_TENANT_ID } from './log.tokens.js';

const OPTIONS = { service: 'test-svc', pretty: false, packageVersion: '1.0.0', seedDefaultSink: false };

describe('LogService', () => {
  let mockIngestion: { emit: ReturnType<typeof vi.fn> };
  let service: LogService;

  beforeEach(() => {
    mockIngestion = { emit: vi.fn().mockResolvedValue(undefined) };
    service = new LogService(OPTIONS, mockIngestion as any);
  });

  // ── log() ─────────────────────────────────────────────────────────────────

  describe('log()', () => {
    it('emits at info level with no context', () => {
      service.log('hello');
      expect(mockIngestion.emit).toHaveBeenCalledWith(
        expect.objectContaining({ level: 'info', message: 'hello', operation: 'system.unknown' }),
      );
    });

    it('emits with string context (operation = system.framework)', () => {
      service.log('hello', 'EntityController');
      expect(mockIngestion.emit).toHaveBeenCalledWith(
        expect.objectContaining({ operation: 'system.framework' }),
      );
    });

    it('emits with LogContext and picks up operation and fields', () => {
      service.log('hello', { operation: 'entity.create', tenantId: '00000000-0000-0000-0000-000000000001' });
      const call = mockIngestion.emit.mock.calls[0]?.[0];
      expect(call.operation).toBe('entity.create');
      expect(call.tenantId).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('uses SERVICE_TENANT_ID when no tenantId in context', () => {
      service.log('hello', { operation: 'test.op' });
      const call = mockIngestion.emit.mock.calls[0]?.[0];
      expect(call.tenantId).toBe(SERVICE_TENANT_ID);
    });

    it('converts non-string message via String()', () => {
      service.log(42);
      expect(mockIngestion.emit).toHaveBeenCalledWith(
        expect.objectContaining({ message: '42' }),
      );
    });
  });

  // ── error() ───────────────────────────────────────────────────────────────

  describe('error()', () => {
    it('emits at error level with no extra args', () => {
      service.error('boom');
      expect(mockIngestion.emit).toHaveBeenCalledWith(
        expect.objectContaining({ level: 'error', message: 'boom' }),
      );
    });

    it('accepts LogContext as second arg', () => {
      service.error('boom', { operation: 'entity.delete' });
      expect(mockIngestion.emit).toHaveBeenCalledWith(
        expect.objectContaining({ operation: 'entity.delete', level: 'error' }),
      );
    });

    it('accepts a string trace as second arg (pino trace field)', () => {
      service.error('boom', 'Error: stack trace here');
      // traceOrContext is a string → no LogContext → operation falls back
      expect(mockIngestion.emit).toHaveBeenCalledWith(
        expect.objectContaining({ level: 'error' }),
      );
    });

    it('accepts empty trace string', () => {
      service.error('boom', '');
      expect(mockIngestion.emit).toHaveBeenCalledTimes(1);
    });

    it('accepts optional context string as third arg', () => {
      service.error('boom', 'trace', 'SomeController');
      expect(mockIngestion.emit).toHaveBeenCalledTimes(1);
    });
  });

  // ── warn() ────────────────────────────────────────────────────────────────

  describe('warn()', () => {
    it('emits at warn level', () => {
      service.warn('careful');
      expect(mockIngestion.emit).toHaveBeenCalledWith(
        expect.objectContaining({ level: 'warn', message: 'careful' }),
      );
    });

    it('accepts LogContext', () => {
      service.warn('careful', { operation: 'entity.update' });
      expect(mockIngestion.emit).toHaveBeenCalledWith(
        expect.objectContaining({ operation: 'entity.update' }),
      );
    });
  });

  // ── debug() ───────────────────────────────────────────────────────────────

  describe('debug()', () => {
    it('emits at debug level', () => {
      service.debug('trace info');
      expect(mockIngestion.emit).toHaveBeenCalledWith(
        expect.objectContaining({ level: 'debug' }),
      );
    });
  });

  // ── verbose() ─────────────────────────────────────────────────────────────

  describe('verbose()', () => {
    it('emits as trace level (pino verbose → trace)', () => {
      service.verbose('noisy');
      expect(mockIngestion.emit).toHaveBeenCalledWith(
        expect.objectContaining({ level: 'trace' }),
      );
    });
  });

  // ── fatal() ───────────────────────────────────────────────────────────────

  describe('fatal()', () => {
    it('emits at fatal level', () => {
      service.fatal('catastrophe');
      expect(mockIngestion.emit).toHaveBeenCalledWith(
        expect.objectContaining({ level: 'fatal' }),
      );
    });
  });

  // ── buildPinoFields context branches ─────────────────────────────────────

  describe('pretty=true builds transport config', () => {
    it('creates service with pretty=true without throwing', () => {
      const prettySvc = new LogService({ ...OPTIONS, pretty: true }, mockIngestion as any);
      expect(prettySvc).toBeDefined();
    });

    it('handles undefined pretty via ?? false fallback', () => {
      // Bypasses Zod schema; exercises the `options.pretty ?? false` defensive branch
      const opts = { service: 'x', packageVersion: '1.0.0', seedDefaultSink: false, pretty: undefined as unknown as boolean };
      const svc = new LogService(opts, mockIngestion as any);
      expect(svc).toBeDefined();
    });
  });

  describe('buildPinoFields', () => {
    it('uses string context: sets operation=system.framework and context.source', () => {
      service.log('msg', 'SomeSource');
      // Pino receives { service, operation, context: { source } }
      // We verify via ingestion call that string context leads to system.framework operation
      expect(mockIngestion.emit).toHaveBeenCalledWith(
        expect.objectContaining({ operation: 'system.framework' }),
      );
    });

    it('LogContext with all optional fields sets them on emitted entry', () => {
      service.log('msg', {
        operation: 'op',
        tenantId: '00000000-0000-0000-0000-000000000001',
        workspaceId: '00000000-0000-0000-0000-000000000002',
        cellId: '00000000-0000-0000-0000-000000000003',
        actorId: 'a1',
        entityId: 'e1',
        eventType: 'created',
        duration: 100,
        errorCode: 'ERR',
        correlationId: '00000000-0000-0000-0000-000000000004',
        metadata: { x: 1 },
        actorType: 'user',
      });
      const call = mockIngestion.emit.mock.calls[0]?.[0];
      expect(call.workspaceId).toBe('00000000-0000-0000-0000-000000000002');
      expect(call.cellId).toBe('00000000-0000-0000-0000-000000000003');
      expect(call.correlationId).toBe('00000000-0000-0000-0000-000000000004');
      expect(call.metadata).toEqual({ x: 1 });
    });

    it('emitToIngestion does not throw when ingestion.emit rejects', async () => {
      mockIngestion.emit.mockRejectedValue(new Error('ingestion down'));
      expect(() => service.log('hello')).not.toThrow();
      // Allow the rejected promise to settle without causing unhandled rejection
      await new Promise((r) => setTimeout(r, 0));
    });
  });
});
