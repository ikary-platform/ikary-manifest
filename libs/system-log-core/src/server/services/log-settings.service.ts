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
    const key = `${tenantId}:${workspaceId ?? ''}:${cellId ?? ''}`;
    this.cache.delete(key);
    if (cellId) {
      this.cache.delete(`${tenantId}:${workspaceId ?? ''}:`);
    }
    if (workspaceId) {
      this.cache.delete(`${tenantId}::`);
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
