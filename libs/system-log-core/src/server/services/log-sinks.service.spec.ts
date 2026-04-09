import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LogSinksService } from './log-sinks.service.js';

const T1 = '00000000-0000-0000-0000-000000000001';
const WS1 = '00000000-0000-0000-0000-000000000002';

const makeSinkRow = (id = 'sink-1') => ({
  id,
  tenant_id: T1,
  workspace_id: null as string | null,
  cell_id: null as string | null,
  scope: 'tenant' as const,
  sink_type: 'persistent' as const,
  retention_hours: 72,
  config: {},
  is_enabled: 1,
  version: 1,
  created_at: new Date(),
  updated_at: new Date(),
});

describe('LogSinksService', () => {
  let mockRepo: {
    findEnabled: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let service: LogSinksService;

  beforeEach(() => {
    mockRepo = {
      findEnabled: vi.fn().mockResolvedValue([]),
      findById: vi.fn().mockResolvedValue(undefined),
      insert: vi.fn().mockResolvedValue(makeSinkRow()),
      update: vi.fn().mockResolvedValue(makeSinkRow()),
    };
    service = new LogSinksService(mockRepo as any);
  });

  // ── getEnabledSinks ───────────────────────────────────────────────────────

  describe('getEnabledSinks', () => {
    it('calls repo.findEnabled on cache miss', async () => {
      mockRepo.findEnabled.mockResolvedValue([makeSinkRow()]);
      const sinks = await service.getEnabledSinks(T1);
      expect(sinks).toHaveLength(1);
      expect(mockRepo.findEnabled).toHaveBeenCalledTimes(1);
    });

    it('returns cached sinks on second call', async () => {
      mockRepo.findEnabled.mockResolvedValue([makeSinkRow()]);
      await service.getEnabledSinks(T1);
      await service.getEnabledSinks(T1);
      expect(mockRepo.findEnabled).toHaveBeenCalledTimes(1);
    });

    it('uses separate cache keys for tenant/workspace/cell combos', async () => {
      await service.getEnabledSinks(T1);
      await service.getEnabledSinks(T1, WS1);
      expect(mockRepo.findEnabled).toHaveBeenCalledTimes(2);
    });

    it('passes workspace and cell to repo', async () => {
      await service.getEnabledSinks(T1, WS1, 'cell-1');
      expect(mockRepo.findEnabled).toHaveBeenCalledWith(T1, WS1, 'cell-1');
    });
  });

  // ── invalidateCache ───────────────────────────────────────────────────────

  describe('invalidateCache', () => {
    it('clears all cache entries for the tenant', async () => {
      mockRepo.findEnabled.mockResolvedValue([makeSinkRow()]);
      await service.getEnabledSinks(T1);
      await service.getEnabledSinks(T1, WS1);
      service.invalidateCache(T1);
      // Both entries cleared — repo called again on next access
      await service.getEnabledSinks(T1);
      expect(mockRepo.findEnabled).toHaveBeenCalledTimes(3);
    });

    it('does not clear cache for a different tenant', async () => {
      mockRepo.findEnabled.mockResolvedValue([]);
      await service.getEnabledSinks(T1);
      service.invalidateCache('other-tenant');
      await service.getEnabledSinks(T1);
      expect(mockRepo.findEnabled).toHaveBeenCalledTimes(1);
    });
  });

  // ── createSink ────────────────────────────────────────────────────────────

  describe('createSink', () => {
    it('inserts via repo and invalidates cache', async () => {
      mockRepo.findEnabled.mockResolvedValue([makeSinkRow()]);
      await service.getEnabledSinks(T1); // seed cache
      await service.createSink({ tenantId: T1, scope: 'tenant', sinkType: 'persistent', retentionHours: 72, config: {} });
      expect(mockRepo.insert).toHaveBeenCalled();
      // Cache invalidated — repo called again
      await service.getEnabledSinks(T1);
      expect(mockRepo.findEnabled).toHaveBeenCalledTimes(2);
    });

    it('returns the inserted row', async () => {
      const row = await service.createSink({ tenantId: T1, scope: 'tenant', sinkType: 'persistent', retentionHours: 72, config: {} });
      expect(row.id).toBe('sink-1');
    });
  });

  // ── updateSink ────────────────────────────────────────────────────────────

  describe('updateSink', () => {
    it('updates via repo and invalidates cache', async () => {
      mockRepo.findEnabled.mockResolvedValue([makeSinkRow()]);
      await service.getEnabledSinks(T1); // seed cache
      await service.updateSink({ id: 'sink-1', tenantId: T1, isEnabled: false, expectedVersion: 1 });
      expect(mockRepo.update).toHaveBeenCalled();
      // Cache invalidated
      await service.getEnabledSinks(T1);
      expect(mockRepo.findEnabled).toHaveBeenCalledTimes(2);
    });

    it('returns the updated row', async () => {
      const row = await service.updateSink({ id: 'sink-1', tenantId: T1, expectedVersion: 1 });
      expect(row).toBeDefined();
    });
  });

  // ── getSink ───────────────────────────────────────────────────────────────

  describe('getSink', () => {
    it('delegates to repo.findById', async () => {
      mockRepo.findById.mockResolvedValue(makeSinkRow());
      const result = await service.getSink('sink-1', T1);
      expect(mockRepo.findById).toHaveBeenCalledWith('sink-1', T1);
      expect(result?.id).toBe('sink-1');
    });

    it('returns undefined when sink not found', async () => {
      expect(await service.getSink('unknown', T1)).toBeUndefined();
    });
  });
});
