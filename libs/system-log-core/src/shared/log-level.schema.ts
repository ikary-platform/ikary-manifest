import { z } from 'zod';

export const logLevelSchema = z.enum(['verbose', 'normal', 'production']);
export type LogLevel = z.infer<typeof logLevelSchema>;
export const LOG_LEVELS = logLevelSchema.options;

export const logEntryLevelSchema = z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']);
export type LogEntryLevel = z.infer<typeof logEntryLevelSchema>;
export const LOG_ENTRY_LEVELS = logEntryLevelSchema.options;
