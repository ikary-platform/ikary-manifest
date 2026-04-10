import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LogSettingsService } from './log-settings.service.js';

const T1 = '00000000-0000-0000-0000-000000000001';
const WS1 = '00000000-0000-0000-0000-000000000002';
const CELL1 = '00000000-0000-0000-0000-000000000003';

const makeRow = (logLevel = 'normal', version = 1) => ({
  id: 'row-1',
  tenant_id: T1,
  workspace_id: null as string | null,
  cell_id: null as string | null,
  scope: 'tenant' as const,
  log_level: logLevel as 'verbose' | 'normal' | 'production',
  version,
  created_at: new Date(),
  updated_at: new Date(),
});

describe('LogSettingsService', () => {
  let mockRepo: {
    findByScope: ReturnType<typeof vi.fn>;
    upsert: ReturnType<typeof vi.fn>;
    cascade: ReturnType<typeof vi.fn>;
  };
  let service: LogSettingsService;

  beforeEach(() => {
    mockRepo = {
      findByScope: vi.fn().mockResolvedValue(undefined),
      upsert: vi.fn().mockResolvedValue(makeRow()),
      cascade: vi.fn().mockResolvedValue(null),
    };
    service = new LogSettingsService(mockRepo as any);
  });

  // ── resolveEffectiveLevel ─────────────────────────────────────────────────

  describe('resolveEffectiveLevel', () => {
    it('calls cascade on cache miss and returns result', async () => {
      mockRepo.cascade.mockResolvedValue('verbose');
      const level = await service.resolveEffectiveLevel(T1);
      expect(level).toBe('verbose');
      expect(mockRepo.cascade).toHaveBeenCalledWith(T1, undefined, undefined);
    });

    it('defaults to "normal" when cascade returns null', async () => {
      mockRepo.cascade.mockResolvedValue(null);
      expect(await service.resolveEffectiveLevel(T1)).toBe('normal');
    });

    it('returns cached value on second call without re-querying', async () => {
      mockRepo.cascade.mockResolvedValue('production');
      await service.resolveEffectiveLevel(T1);
      await service.resolveEffectiveLevel(T1);
      expect(mockRepo.cascade).toHaveBeenCalledTimes(1);
    });

    it('passes workspace and cell to cascade', async () => {
      await service.resolveEffectiveLevel(T1, WS1, CELL1);
      expect(mockRepo.cascade).toHaveBeenCalledWith(T1, WS1, CELL1);
    });
  });

  // ── invalidateCache ───────────────────────────────────────────────────────

  describe('invalidateCache', () => {
    it('clears a tenant-level cache entry', async () => {
      mockRepo.cascade.mockResolvedValue('verbose');
      await service.resolveEffectiveLevel(T1);
      service.invalidateCache(T1);
      mockRepo.cascade.mockResolvedValue('normal');
      expect(await service.resolveEffectiveLevel(T1)).toBe('normal');
    });

    it('clears workspace and tenant keys when workspace specified', async () => {
      mockRepo.cascade.mockResolvedValue('verbose');
      await service.resolveEffectiveLevel(T1, WS1);
      await service.resolveEffectiveLevel(T1);
      service.invalidateCache(T1, WS1);
      // Both keys cleared — cascade called again
      mockRepo.cascade.mockResolvedValue('normal');
      expect(await service.resolveEffectiveLevel(T1, WS1)).toBe('normal');
    });

    it('clears cell, workspace and tenant keys when cell specified', async () => {
      mockRepo.cascade.mockResolvedValue('verbose');
      await service.resolveEffectiveLevel(T1, WS1, CELL1);
      await service.resolveEffectiveLevel(T1, WS1);
      await service.resolveEffectiveLevel(T1);
      service.invalidateCache(T1, WS1, CELL1);
      // All three keys cleared
      expect(mockRepo.cascade).toHaveBeenCalledTimes(3);
      mockRepo.cascade.mockResolvedValue('production');
      await service.resolveEffectiveLevel(T1, WS1, CELL1);
      expect(mockRepo.cascade).toHaveBeenCalledTimes(4); // re-fetched
    });

    it('clears cell key with null workspaceId (covers ?? "" in delete key)', async () => {
      mockRepo.cascade.mockResolvedValue('verbose');
      await service.resolveEffectiveLevel(T1, null, CELL1);
      service.invalidateCache(T1, null, CELL1);
      mockRepo.cascade.mockResolvedValue('normal');
      await service.resolveEffectiveLevel(T1, null, CELL1);
      expect(mockRepo.cascade).toHaveBeenCalledTimes(2);
    });

    it('tenant invalidation clears workspace and cell descendants', async () => {
      mockRepo.cascade.mockResolvedValue('verbose');
      await service.resolveEffectiveLevel(T1);           // seeds T1::
      await service.resolveEffectiveLevel(T1, WS1);      // seeds T1:WS1:
      await service.resolveEffectiveLevel(T1, WS1, CELL1); // seeds T1:WS1:CELL1
      service.invalidateCache(T1);  // should clear ALL T1:* entries

      mockRepo.cascade.mockResolvedValue('normal');
      await service.resolveEffectiveLevel(T1);
      await service.resolveEffectiveLevel(T1, WS1);
      await service.resolveEffectiveLevel(T1, WS1, CELL1);
      // All 3 re-fetched after tenant invalidation
      expect(mockRepo.cascade).toHaveBeenCalledTimes(6);
    });

    it('workspace invalidation clears cell descendants but not tenant', async () => {
      mockRepo.cascade.mockResolvedValue('verbose');
      await service.resolveEffectiveLevel(T1);           // seeds T1::
      await service.resolveEffectiveLevel(T1, WS1);      // seeds T1:WS1:
      await service.resolveEffectiveLevel(T1, WS1, CELL1); // seeds T1:WS1:CELL1
      service.invalidateCache(T1, WS1);  // clears T1:WS1:* but NOT T1::

      mockRepo.cascade.mockResolvedValue('normal');
      // T1:: still cached — no extra cascade call
      expect(await service.resolveEffectiveLevel(T1)).toBe('verbose');
      // T1:WS1: cleared — re-fetched
      expect(await service.resolveEffectiveLevel(T1, WS1)).toBe('normal');
      // T1:WS1:CELL1 cleared — re-fetched
      expect(await service.resolveEffectiveLevel(T1, WS1, CELL1)).toBe('normal');
      expect(mockRepo.cascade).toHaveBeenCalledTimes(5); // 3 seeds + 2 re-fetches
    });
  });

  // ── getters ───────────────────────────────────────────────────────────────

  describe('getTenantSettings', () => {
    it('calls findByScope with null workspace and cell', async () => {
      mockRepo.findByScope.mockResolvedValue(makeRow());
      const result = await service.getTenantSettings(T1);
      expect(mockRepo.findByScope).toHaveBeenCalledWith(T1, null, null);
      expect(result).toBeDefined();
    });
  });

  describe('getWorkspaceSettings', () => {
    it('calls findByScope with workspace and null cell', async () => {
      await service.getWorkspaceSettings(T1, WS1);
      expect(mockRepo.findByScope).toHaveBeenCalledWith(T1, WS1, null);
    });
  });

  describe('getCellSettings', () => {
    it('calls findByScope with all three ids', async () => {
      await service.getCellSettings(T1, WS1, CELL1);
      expect(mockRepo.findByScope).toHaveBeenCalledWith(T1, WS1, CELL1);
    });
  });

  // ── upserts ───────────────────────────────────────────────────────────────

  describe('upsertTenantSettings', () => {
    it('calls repo.upsert with tenant scope and invalidates cache', async () => {
      mockRepo.cascade.mockResolvedValue('verbose');
      await service.resolveEffectiveLevel(T1); // seed cache
      await service.upsertTenantSettings(T1, 'production', 0);
      expect(mockRepo.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: T1, scope: 'tenant', logLevel: 'production' }),
      );
      // cache was invalidated — next resolve calls cascade again
      mockRepo.cascade.mockResolvedValue('production');
      await service.resolveEffectiveLevel(T1);
      expect(mockRepo.cascade).toHaveBeenCalledTimes(2);
    });
  });

  describe('upsertWorkspaceSettings', () => {
    it('calls repo.upsert with workspace scope', async () => {
      await service.upsertWorkspaceSettings(T1, WS1, 'verbose', 0);
      expect(mockRepo.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: T1, workspaceId: WS1, scope: 'workspace' }),
      );
    });
  });

  describe('upsertCellSettings', () => {
    it('calls repo.upsert with cell scope', async () => {
      await service.upsertCellSettings(T1, WS1, CELL1, 'production', 0);
      expect(mockRepo.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: T1, workspaceId: WS1, cellId: CELL1, scope: 'cell' }),
      );
    });
  });
});
