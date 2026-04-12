import { describe, it, expect } from 'vitest';
import { localeCodeSchema, messageIdSchema, localeMessagesSchema } from './message.types';

describe('localeCodeSchema', () => {
  it('accepts simple locale codes', () => {
    expect(localeCodeSchema.safeParse('en').success).toBe(true);
    expect(localeCodeSchema.safeParse('fr').success).toBe(true);
  });

  it('accepts locale codes with region', () => {
    expect(localeCodeSchema.safeParse('pt-BR').success).toBe(true);
    expect(localeCodeSchema.safeParse('en-US').success).toBe(true);
  });

  it('rejects invalid locale codes', () => {
    expect(localeCodeSchema.safeParse('').success).toBe(false);
    expect(localeCodeSchema.safeParse('e').success).toBe(false);
    expect(localeCodeSchema.safeParse('english').success).toBe(false);
    expect(localeCodeSchema.safeParse('EN').success).toBe(false);
    expect(localeCodeSchema.safeParse('en-us').success).toBe(false); // lowercase region
  });
});

describe('messageIdSchema', () => {
  it('accepts valid dotted identifiers', () => {
    expect(messageIdSchema.safeParse('auth.login.title').success).toBe(true);
    expect(messageIdSchema.safeParse('workspace.create_form.submit').success).toBe(true);
  });

  it('rejects ids without dots', () => {
    expect(messageIdSchema.safeParse('notdotted').success).toBe(false);
  });

  it('rejects ids with uppercase', () => {
    expect(messageIdSchema.safeParse('Auth.Login').success).toBe(false);
  });

  it('rejects ids shorter than 3 chars', () => {
    expect(messageIdSchema.safeParse('a.').success).toBe(false);
  });
});

describe('localeMessagesSchema', () => {
  it('accepts valid message records', () => {
    const result = localeMessagesSchema.safeParse({ 'auth.login': 'Login' });
    expect(result.success).toBe(true);
  });

  it('accepts empty records', () => {
    expect(localeMessagesSchema.safeParse({}).success).toBe(true);
  });
});
