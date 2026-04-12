import { z } from 'zod';

export const localeCodeSchema = z
  .string()
  .trim()
  .min(2)
  .max(16)
  .regex(/^[a-z]{2}(?:-[A-Z]{2})?$/, 'Locale must be a BCP-47 style tag such as en, fr, or pt-BR.');

export const messageIdSchema = z
  .string()
  .trim()
  .min(3)
  .max(200)
  .regex(/^[a-z0-9_]+(?:\.[a-z0-9_]+)+$/, 'Message ids must be flat, namespaced keys such as auth.login.title.');

export const localeMessagesSchema = z.record(messageIdSchema, z.string());

export type LocaleCode = z.infer<typeof localeCodeSchema>;
export type MessageId = z.infer<typeof messageIdSchema>;
export type LocaleMessages = z.infer<typeof localeMessagesSchema>;

export interface MessageDescriptor {
  id: MessageId;
  defaultMessage: string;
}
