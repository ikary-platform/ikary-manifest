import { Injectable } from '@nestjs/common';
import { LogRepository } from '../repositories/log.repository';
import { LogSinksService } from './log-sinks.service';
import { LogSettingsService } from './log-settings.service';
import { externalSinkConfigSchema } from '../../shared/log-sink.schema';
import type { LogEntry } from '../log.types';
import type { LogEntryLevel, LogLevel } from '../../shared/log-level.schema';
import type { LogSinkRow } from '../repositories/log-sinks.repository';

function shouldEmitForLevel(entryLevel: LogEntryLevel, settingLevel: LogLevel): boolean {
  const thresholds: Record<LogLevel, number> = {
    verbose: 0,
    normal: 2,
    production: 4,
  };
  const entryRank: Record<LogEntryLevel, number> = {
    trace: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
    fatal: 5,
  };
  return entryRank[entryLevel] >= thresholds[settingLevel];
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

@Injectable()
export class LogIngestionService {
  constructor(
    private readonly repo: LogRepository,
    private readonly sinksService: LogSinksService,
    private readonly settingsService: LogSettingsService,
  ) {}

  async emit(entry: LogEntry): Promise<void> {
    try {
      const sinks = await this.sinksService.getEnabledSinks(entry.tenantId, entry.workspaceId, entry.cellId);
      if (sinks.length === 0) return;

      const effectiveLevel = await this.settingsService.resolveEffectiveLevel(
        entry.tenantId,
        entry.workspaceId,
        entry.cellId,
      );

      if (!shouldEmitForLevel(entry.level, effectiveLevel)) return;

      await Promise.allSettled(sinks.map((sink) => this.writeTo(sink, entry)));
    } catch {
      // Ingestion errors must never propagate to the caller
    }
  }

  private async writeTo(sink: LogSinkRow, entry: LogEntry): Promise<void> {
    const expiresAt = addHours(new Date(), sink.retention_hours);

    if (sink.sink_type === 'ui' || sink.sink_type === 'persistent') {
      await this.repo.insert(entry, sink.sink_type, expiresAt);
    } else if (sink.sink_type === 'external') {
      const parsed = externalSinkConfigSchema.safeParse(sink.config);
      if (!parsed.success) return;

      void fetch(parsed.data.endpoint, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...parsed.data.headers,
        },
        signal: AbortSignal.timeout(parsed.data.timeoutMs),
        body: JSON.stringify({
          ...entry,
          sinkType: sink.sink_type,
          loggedAt: new Date().toISOString(),
        }),
      }).catch(() => {});
    }
  }
}
