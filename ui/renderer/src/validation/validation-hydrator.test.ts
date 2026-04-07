import { describe, it, expect } from 'vitest';
import { hydrateValidationIssues } from './validation-hydrator';
import type { ValidationIssue } from '@ikary/contract';

function issue(
  ruleId: string,
  path: string | undefined,
  opts: { defaultMessage?: string; messageKey?: string } = {},
): ValidationIssue {
  return {
    ruleId,
    path,
    defaultMessage: opts.defaultMessage,
    messageKey: opts.messageKey ?? ruleId,
  } as unknown as ValidationIssue;
}

describe('hydrateValidationIssues', () => {
  it('returns empty collections for empty input', () => {
    const result = hydrateValidationIssues([]);
    expect(result.fieldErrors).toEqual({});
    expect(result.summaryIssues).toEqual([]);
  });

  it('maps issue with path to fieldErrors', () => {
    const result = hydrateValidationIssues([issue('required', 'name', { defaultMessage: 'Name is required' })]);
    expect(result.fieldErrors['name']).toEqual({
      message: 'Name is required',
      ruleId: 'required',
    });
    expect(result.summaryIssues).toHaveLength(0);
  });

  it('uses messageKey as fallback when defaultMessage is absent', () => {
    const result = hydrateValidationIssues([issue('email.format', 'email', { messageKey: 'validation.email' })]);
    expect(result.fieldErrors['email'].message).toBe('validation.email');
  });

  it('adds issue without path to summaryIssues', () => {
    const i = issue('entity.rule', undefined);
    const result = hydrateValidationIssues([i]);
    expect(result.fieldErrors).toEqual({});
    expect(result.summaryIssues).toContain(i);
  });

  it('only keeps first error per field path', () => {
    const first = issue('required', 'name', { defaultMessage: 'First error' });
    const second = issue('min_length', 'name', { defaultMessage: 'Second error' });
    const result = hydrateValidationIssues([first, second]);
    expect(result.fieldErrors['name'].message).toBe('First error');
    // Second is pushed to summary since path already taken
    expect(result.summaryIssues).toContain(second);
  });

  it('handles multiple unique field paths', () => {
    const result = hydrateValidationIssues([
      issue('required', 'name', { defaultMessage: 'Name required' }),
      issue('email', 'email', { defaultMessage: 'Invalid email' }),
    ]);
    expect(Object.keys(result.fieldErrors)).toHaveLength(2);
    expect(result.summaryIssues).toHaveLength(0);
  });
});
