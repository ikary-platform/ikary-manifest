import { Injectable } from '@nestjs/common';
import { LogSettingsRepository, type LogSettingsRow } from '../repositories/log-settings.repository';
import type { LogLevel } from '../../shared/log-level.schema';

interface CacheEntry {
  level: LogLevel;
  cachedAt: number;
}

const CACHE_TTL_MS = 60_000;

@Injectable()
export class LogSettingsService {
  private readonly cache = new Map<string, CacheEntry>();

  constructor(private readonly repo: LogSettingsRepository) {}

  async resolveEffectiveLevel(
    tenantId: string,
    workspaceId?: string | null,
    cellId?: string | null,
  ): Promise<LogLevel> {
    const key = `${tenantId}:${workspaceId ?? ''}:${cellId ?? ''}`;
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      return cached.level;
    }

    const level = await this.repo.cascade(tenantId, workspaceId, cellId);
    const resolved: LogLevel = level ?? 'normal';
    this.cache.set(key, { level: resolved, cachedAt: Date.now() });
    return resolved;
  }

  invalidateCache(tenantId: string, workspaceId?: string | null, cellId?: string | null): void {
    if (cellId) {
      // Cell-level change: only affects this exact key
      this.cache.delete(`${tenantId}:${workspaceId ?? ''}:${cellId}`);
    } else if (workspaceId) {
      // Workspace-level change: clear this workspace and all its cell descendants
      const prefix = `${tenantId}:${workspaceId}:`;
      for (const k of this.cache.keys()) {
        if (k.startsWith(prefix) || k === `${tenantId}:${workspaceId}:`) {
          this.cache.delete(k);
        }
      }
    } else {
      // Tenant-level change: clear all entries for this tenant
      const prefix = `${tenantId}:`;
      for (const k of this.cache.keys()) {
        if (k.startsWith(prefix)) {
          this.cache.delete(k);
        }
      }
    }
  }

  async getTenantSettings(tenantId: string): Promise<LogSettingsRow | undefined> {
    return this.repo.findByScope(tenantId, null, null);
  }

  async getWorkspaceSettings(tenantId: string, workspaceId: string): Promise<LogSettingsRow | undefined> {
    return this.repo.findByScope(tenantId, workspaceId, null);
  }

  async getCellSettings(tenantId: string, workspaceId: string, cellId: string): Promise<LogSettingsRow | undefined> {
    return this.repo.findByScope(tenantId, workspaceId, cellId);
  }

  async upsertTenantSettings(tenantId: string, logLevel: LogLevel, expectedVersion: number): Promise<LogSettingsRow> {
    const result = await this.repo.upsert({ tenantId, scope: 'tenant', logLevel, expectedVersion });
    this.invalidateCache(tenantId);
    return result;
  }

  async upsertWorkspaceSettings(
    tenantId: string,
    workspaceId: string,
    logLevel: LogLevel,
    expectedVersion: number,
  ): Promise<LogSettingsRow> {
    const result = await this.repo.upsert({ tenantId, workspaceId, scope: 'workspace', logLevel, expectedVersion });
    this.invalidateCache(tenantId, workspaceId);
    return result;
  }

  async upsertCellSettings(
    tenantId: string,
    workspaceId: string,
    cellId: string,
    logLevel: LogLevel,
    expectedVersion: number,
  ): Promise<LogSettingsRow> {
    const result = await this.repo.upsert({ tenantId, workspaceId, cellId, scope: 'cell', logLevel, expectedVersion });
    this.invalidateCache(tenantId, workspaceId, cellId);
    return result;
  }
}
