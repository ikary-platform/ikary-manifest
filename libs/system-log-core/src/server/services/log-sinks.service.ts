import { Injectable } from '@nestjs/common';
import { LogSinksRepository, type LogSinkRow } from '../repositories/log-sinks.repository';

interface SinkCacheEntry {
  sinks: LogSinkRow[];
  cachedAt: number;
}

const CACHE_TTL_MS = 60_000;

@Injectable()
export class LogSinksService {
  private readonly cache = new Map<string, SinkCacheEntry>();

  constructor(private readonly repo: LogSinksRepository) {}

  async getEnabledSinks(tenantId: string, workspaceId?: string | null, cellId?: string | null): Promise<LogSinkRow[]> {
    const key = `${tenantId}:${workspaceId ?? ''}:${cellId ?? ''}`;
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      return cached.sinks;
    }

    const sinks = await this.repo.findEnabled(tenantId, workspaceId, cellId);
    this.cache.set(key, { sinks, cachedAt: Date.now() });
    return sinks;
  }

  invalidateCache(tenantId: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${tenantId}:`)) {
        this.cache.delete(key);
      }
    }
  }

  async createSink(input: {
    tenantId: string;
    workspaceId?: string | null;
    cellId?: string | null;
    scope: 'tenant' | 'workspace' | 'cell';
    sinkType: 'ui' | 'persistent' | 'external';
    retentionHours: number;
    config: Record<string, unknown>;
  }): Promise<LogSinkRow> {
    const result = await this.repo.insert(input);
    this.invalidateCache(input.tenantId);
    return result;
  }

  async updateSink(input: {
    id: string;
    tenantId: string;
    retentionHours?: number;
    config?: Record<string, unknown>;
    isEnabled?: boolean;
    expectedVersion: number;
  }): Promise<LogSinkRow> {
    const result = await this.repo.update(input);
    this.invalidateCache(input.tenantId);
    return result;
  }

  async getSink(id: string, tenantId: string): Promise<LogSinkRow | undefined> {
    return this.repo.findById(id, tenantId);
  }
}
