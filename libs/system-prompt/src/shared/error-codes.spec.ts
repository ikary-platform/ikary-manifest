import { describe, expect, it } from 'vitest';
import { PROMPT_ERROR_CODES, PromptRegistryError } from './error-codes';

describe('PromptRegistryError', () => {
  it('captures code, message, and optional details', () => {
    const err = new PromptRegistryError(
      PROMPT_ERROR_CODES.PROMPT_NOT_FOUND,
      'missing prompt',
      { name: 'cell-ai/foo' },
    );
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('PromptRegistryError');
    expect(err.code).toBe('PROMPT_NOT_FOUND');
    expect(err.message).toBe('missing prompt');
    expect(err.details).toEqual({ name: 'cell-ai/foo' });
  });

  it('allows omitting the details payload', () => {
    const err = new PromptRegistryError(
      PROMPT_ERROR_CODES.PROMPT_RENDER_FAILED,
      'kaboom',
    );
    expect(err.details).toBeUndefined();
  });
});
