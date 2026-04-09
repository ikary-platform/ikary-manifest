import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LogIngestionService } from './log-ingestion.service.js';
import type { LogEntry } from '../log.types.js';

const TENANT_ID = '00000000-0000-0000-0000-000000000001';

const makeSink = (overrides: Partial<ReturnType<typeof makeSink>> = {}) => ({
  id: 'sink-1',
  tenant_id: TENANT_ID,
  workspace_id: null,
  cell_id: null,
  scope: 'tenant' as const,
  sink_type: 'persistent' as const,
  retention_hours: 72,
  config: {},
  is_enabled: 1,
  version: 1,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

function makeEntry(level: LogEntry['level'] = 'info'): LogEntry {
  return {
    tenantId: TENANT_ID,
    tenantSlug: 'acme',
    workspaceId: null,
    cellId: null,
    service: 'test',
    operation: 'test.op',
    level,
    message: 'hello',
    correlationId: null,
    actorId: null,
    actorType: null,
    metadata: null,
  };
}

describe('LogIngestionService', () => {
  let mockRepo: { insert: ReturnType<typeof vi.fn> };
  let mockSinksService: { getEnabledSinks: ReturnType<typeof vi.fn> };
  let mockSettingsService: { resolveEffectiveLevel: ReturnType<typeof vi.fn> };
  let service: LogIngestionService;

  beforeEach(() => {
    mockRepo = { insert: vi.fn().mockResolvedValue(undefined) };
    mockSinksService = { getEnabledSinks: vi.fn().mockResolvedValue([]) };
    mockSettingsService = { resolveEffectiveLevel: vi.fn().mockResolvedValue('normal') };
    service = new LogIngestionService(mockRepo as any, mockSinksService as any, mockSettingsService as any);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // ── emit — early exits ────────────────────────────────────────────────────

  it('returns early when no sinks are configured', async () => {
    mockSinksService.getEnabledSinks.mockResolvedValue([]);
    await service.emit(makeEntry());
    expect(mockRepo.insert).not.toHaveBeenCalled();
  });

  it('swallows exceptions thrown by sinks service', async () => {
    mockSinksService.getEnabledSinks.mockRejectedValue(new Error('DB down'));
    await expect(service.emit(makeEntry())).resolves.not.toThrow();
  });

  // ── emit — level filtering ────────────────────────────────────────────────

  it('filters trace entry under "normal" setting (verbose=0, threshold=2)', async () => {
    mockSinksService.getEnabledSinks.mockResolvedValue([makeSink()]);
    mockSettingsService.resolveEffectiveLevel.mockResolvedValue('normal');
    await service.emit(makeEntry('trace'));
    expect(mockRepo.insert).not.toHaveBeenCalled();
  });

  it('filters debug entry under "normal" setting', async () => {
    mockSinksService.getEnabledSinks.mockResolvedValue([makeSink()]);
    mockSettingsService.resolveEffectiveLevel.mockResolvedValue('normal');
    await service.emit(makeEntry('debug'));
    expect(mockRepo.insert).not.toHaveBeenCalled();
  });

  it('passes info entry under "normal" setting (rank 2 >= threshold 2)', async () => {
    mockSinksService.getEnabledSinks.mockResolvedValue([makeSink()]);
    mockSettingsService.resolveEffectiveLevel.mockResolvedValue('normal');
    await service.emit(makeEntry('info'));
    expect(mockRepo.insert).toHaveBeenCalledTimes(1);
  });

  it('passes trace entry under "verbose" setting (threshold 0)', async () => {
    mockSinksService.getEnabledSinks.mockResolvedValue([makeSink()]);
    mockSettingsService.resolveEffectiveLevel.mockResolvedValue('verbose');
    await service.emit(makeEntry('trace'));
    expect(mockRepo.insert).toHaveBeenCalledTimes(1);
  });

  it('filters warn entry under "production" setting (rank 3 < threshold 4)', async () => {
    mockSinksService.getEnabledSinks.mockResolvedValue([makeSink()]);
    mockSettingsService.resolveEffectiveLevel.mockResolvedValue('production');
    await service.emit(makeEntry('warn'));
    expect(mockRepo.insert).not.toHaveBeenCalled();
  });

  it('passes error entry under "production" setting (rank 4 >= threshold 4)', async () => {
    mockSinksService.getEnabledSinks.mockResolvedValue([makeSink()]);
    mockSettingsService.resolveEffectiveLevel.mockResolvedValue('production');
    await service.emit(makeEntry('error'));
    expect(mockRepo.insert).toHaveBeenCalledTimes(1);
  });

  it('passes fatal entry under any setting', async () => {
    mockSinksService.getEnabledSinks.mockResolvedValue([makeSink()]);
    mockSettingsService.resolveEffectiveLevel.mockResolvedValue('production');
    await service.emit(makeEntry('fatal'));
    expect(mockRepo.insert).toHaveBeenCalledTimes(1);
  });

  // ── emit — sink types ─────────────────────────────────────────────────────

  it('writes to persistent sink via repo.insert', async () => {
    mockSinksService.getEnabledSinks.mockResolvedValue([makeSink({ sink_type: 'persistent' })]);
    await service.emit(makeEntry());
    expect(mockRepo.insert).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'info' }),
      'persistent',
      expect.any(Date),
    );
  });

  it('writes to ui sink via repo.insert', async () => {
    mockSinksService.getEnabledSinks.mockResolvedValue([makeSink({ sink_type: 'ui' })]);
    await service.emit(makeEntry());
    expect(mockRepo.insert).toHaveBeenCalledWith(expect.anything(), 'ui', expect.any(Date));
  });

  it('fires fetch for external sink with valid config', async () => {
    mockSinksService.getEnabledSinks.mockResolvedValue([
      makeSink({
        sink_type: 'external',
        config: { endpoint: 'https://logs.example.com', timeoutMs: 5000 },
      }),
    ]);
    await service.emit(makeEntry());
    // fetch is fired via void (fire-and-forget), allow microtasks
    await new Promise((r) => setTimeout(r, 0));
    expect(fetch).toHaveBeenCalledWith(
      'https://logs.example.com',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('fires fetch with custom headers', async () => {
    mockSinksService.getEnabledSinks.mockResolvedValue([
      makeSink({
        sink_type: 'external',
        config: { endpoint: 'https://x.com', headers: { 'x-key': 'secret' }, timeoutMs: 3000 },
      }),
    ]);
    await service.emit(makeEntry());
    await new Promise((r) => setTimeout(r, 0));
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ 'x-key': 'secret' }),
      }),
    );
  });

  it('skips fetch when external sink config is invalid', async () => {
    mockSinksService.getEnabledSinks.mockResolvedValue([
      makeSink({ sink_type: 'external', config: { not_a_valid_config: true } }),
    ]);
    await service.emit(makeEntry());
    await new Promise((r) => setTimeout(r, 0));
    expect(fetch).not.toHaveBeenCalled();
  });

  it('does not propagate when repo.insert throws', async () => {
    mockSinksService.getEnabledSinks.mockResolvedValue([makeSink()]);
    mockRepo.insert.mockRejectedValue(new Error('DB error'));
    await expect(service.emit(makeEntry())).resolves.not.toThrow();
  });
});
