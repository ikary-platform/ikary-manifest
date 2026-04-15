import { describe, it, expect } from 'vitest';
import { EntityNotFoundError, VersionConflictError, InvalidTransitionError, CapabilityNotFoundError } from './errors.js';

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

describe('InvalidTransitionError', () => {
  it('has name InvalidTransitionError', () => {
    const err = new InvalidTransitionError('invoice', 'publish', 'paid', 'draft');
    expect(err.name).toBe('InvalidTransitionError');
  });

  it('message contains transition key, entity key, current state, and expected state', () => {
    const err = new InvalidTransitionError('invoice', 'publish', 'paid', 'draft');
    expect(err.message).toContain('publish');
    expect(err.message).toContain('invoice');
    expect(err.message).toContain('paid');
    expect(err.message).toContain('draft');
  });

  it('is an instance of Error', () => {
    expect(new InvalidTransitionError('a', 'b', 'c', 'd')).toBeInstanceOf(Error);
  });
});

describe('CapabilityNotFoundError', () => {
  it('has name CapabilityNotFoundError', () => {
    const err = new CapabilityNotFoundError('invoice', 'export_pdf');
    expect(err.name).toBe('CapabilityNotFoundError');
  });

  it('message contains entity key and capability key', () => {
    const err = new CapabilityNotFoundError('invoice', 'export_pdf');
    expect(err.message).toContain('invoice');
    expect(err.message).toContain('export_pdf');
  });

  it('is an instance of Error', () => {
    expect(new CapabilityNotFoundError('x', 'y')).toBeInstanceOf(Error);
  });
});
