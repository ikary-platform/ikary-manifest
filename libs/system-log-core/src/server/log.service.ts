import { Inject, Injectable, type LoggerService } from '@nestjs/common';
import pino from 'pino';
import { SYSTEM_LOG_MODULE_OPTIONS, SERVICE_TENANT_ID } from './log.tokens';
import type { SystemLogModuleOptions } from './log.options.schema';
import type { LogEntry } from './log.types';
import { LogIngestionService } from './services/log-ingestion.service';
import type { LogContext } from '../shared/log-context.schema';
import type { LogEntryLevel } from '../shared/log-level.schema';

function toEntryLevel(pinoLevel: string): LogEntryLevel {
  if (pinoLevel === 'verbose') return 'trace';
  return pinoLevel as LogEntryLevel;
}

function buildPinoOptions(pretty: boolean): pino.LoggerOptions {
  const base: pino.LoggerOptions = {
    level: 'trace',
    base: null,
    messageKey: 'message',
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({ level: label }),
    },
  };

  if (!pretty) return base;

  return {
    ...base,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        messageKey: 'message',
      },
    },
  };
}

@Injectable()
export class LogService implements LoggerService {
  private readonly pinoLogger: pino.Logger;
  private readonly service: string;

  constructor(
    @Inject(SYSTEM_LOG_MODULE_OPTIONS) private readonly options: SystemLogModuleOptions,
    private readonly ingestion: LogIngestionService,
  ) {
    this.service = options.service;
    this.pinoLogger = pino(buildPinoOptions(options.pretty ?? false));
  }

  private buildPinoFields(context?: string | LogContext): Record<string, unknown> {
    const fields: Record<string, unknown> = { service: this.service };

    if (typeof context === 'string') {
      fields['operation'] = 'system.framework';
      fields['context'] = { source: context };
    } else if (context && typeof context === 'object') {
      fields['operation'] = context.operation;
      if (context.correlationId) fields['correlationId'] = context.correlationId;

      const ctx: Record<string, unknown> = {};
      if (context.tenantId !== undefined) ctx['tenantId'] = context.tenantId;
      if (context.workspaceId !== undefined) ctx['workspaceId'] = context.workspaceId;
      if (context.cellId !== undefined) ctx['cellId'] = context.cellId;
      if (context.actorId !== undefined) ctx['actorId'] = context.actorId;
      if (context.entityId !== undefined) ctx['entityId'] = context.entityId;
      if (context.eventType !== undefined) ctx['eventType'] = context.eventType;
      if (context.duration !== undefined) ctx['duration'] = context.duration;
      if (context.errorCode !== undefined) ctx['errorCode'] = context.errorCode;
      if (context.metadata !== undefined) ctx['metadata'] = context.metadata;
      fields['context'] = ctx;
    }

    return fields;
  }

  private emitToIngestion(pinoLevel: string, message: string, context?: string | LogContext): void {
    const resolvedContext = typeof context === 'object' ? context : undefined;
    const operation =
      resolvedContext?.operation ?? (typeof context === 'string' ? 'system.framework' : 'system.unknown');

    const entry: LogEntry = {
      tenantId: resolvedContext?.tenantId ?? SERVICE_TENANT_ID,
      tenantSlug: resolvedContext?.tenantId ?? 'system',
      workspaceId: resolvedContext?.workspaceId ?? null,
      cellId: resolvedContext?.cellId ?? null,
      service: this.service,
      operation,
      level: toEntryLevel(pinoLevel),
      message,
      correlationId: resolvedContext?.correlationId ?? null,
      actorId: resolvedContext?.actorId ?? null,
      actorType: resolvedContext?.actorType ?? null,
      metadata: resolvedContext?.metadata ?? null,
    };

    void this.ingestion.emit(entry).catch(() => {});
  }

  log(message: unknown, context?: string | LogContext): void {
    const fields = this.buildPinoFields(context);
    this.pinoLogger.info(fields, String(message));
    this.emitToIngestion('info', String(message), context);
  }

  error(message: unknown, traceOrContext?: string | LogContext, context?: string): void {
    const fields = this.buildPinoFields(typeof traceOrContext === 'object' ? traceOrContext : context);
    if (typeof traceOrContext === 'string' && traceOrContext) {
      fields['trace'] = traceOrContext;
    }
    this.pinoLogger.error(fields, String(message));
    this.emitToIngestion('error', String(message), typeof traceOrContext === 'object' ? traceOrContext : undefined);
  }

  warn(message: unknown, context?: string | LogContext): void {
    const fields = this.buildPinoFields(context);
    this.pinoLogger.warn(fields, String(message));
    this.emitToIngestion('warn', String(message), context);
  }

  debug(message: unknown, context?: string | LogContext): void {
    const fields = this.buildPinoFields(context);
    this.pinoLogger.debug(fields, String(message));
    this.emitToIngestion('debug', String(message), context);
  }

  verbose(message: unknown, context?: string | LogContext): void {
    const fields = this.buildPinoFields(context);
    this.pinoLogger.trace(fields, String(message));
    this.emitToIngestion('verbose', String(message), context);
  }

  fatal(message: unknown, context?: string | LogContext): void {
    const fields = this.buildPinoFields(context);
    this.pinoLogger.fatal(fields, String(message));
    this.emitToIngestion('fatal', String(message), context);
  }
}
