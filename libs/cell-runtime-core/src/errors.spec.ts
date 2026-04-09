import { describe, it, expect } from 'vitest';
import { EntityNotFoundError, VersionConflictError } from './errors.js';

describe('EntityNotFoundError', () => {
  it('has name EntityNotFoundError', () => {
    const err = new EntityNotFoundError('customer', '123');
    expect(err.name).toBe('EntityNotFoundError');
  });

  it('message includes entityKey and id', () => {
    const err = new EntityNotFoundError('customer', '123');
    expect(err.message).toContain('customer');
    expect(err.message).toContain('123');
  });

  it('is an instance of Error', () => {
    expect(new EntityNotFoundError('x', 'y')).toBeInstanceOf(Error);
  });
});

describe('VersionConflictError', () => {
  it('has name VersionConflictError', () => {
    const err = new VersionConflictError('order', 'abc', 1, 3);
    expect(err.name).toBe('VersionConflictError');
  });

  it('message includes expected and actual versions', () => {
    const err = new VersionConflictError('order', 'abc', 1, 3);
    expect(err.message).toContain('v1');
    expect(err.message).toContain('v3');
  });

  it('is an instance of Error', () => {
    expect(new VersionConflictError('x', 'y', 1, 2)).toBeInstanceOf(Error);
  });
});
