import { describe, it, expect, vi } from 'vitest';
import { entityHeaderResolver } from './resolver';
import type { RuntimeContext } from '../../registry/resolverRegistry';

const minimalContext: RuntimeContext = {
  entity: { key: 'ticket', name: 'Ticket', pluralName: 'Tickets', fields: [] },
  record: { name: 'My Ticket', type: 'bug', state: 'open' },
  actions: {
    navigate: vi.fn(),
    mutate: vi.fn(),
    delete: vi.fn(),
  },
  ui: {
    notify: vi.fn(),
    confirm: vi.fn(),
  },
};

describe('entityHeaderResolver', () => {
  it('resolves title and subtitle from field bindings', () => {
    const result = entityHeaderResolver(minimalContext, {
      title: { field: 'name' },
      subtitle: { field: 'type' },
      status: { field: 'state' },
    });
    expect(result.title).toBe('My Ticket');
    expect(result.subtitle).toBe('bug');
    expect(result.status).toEqual({ label: 'open' });
  });

  it('returns empty strings when bindings resolve to null/undefined', () => {
    const result = entityHeaderResolver(minimalContext, {
      title: { field: 'missing' },
      subtitle: { field: 'also_missing' },
      status: { field: 'nope' },
    });
    expect(result.title).toBe('');
    expect(result.subtitle).toBe('');
    expect(result.status).toEqual({ label: '' });
  });

  it('uses empty object when record is undefined on context', () => {
    const ctx: RuntimeContext = { ...minimalContext, record: undefined };
    const result = entityHeaderResolver(ctx, {
      title: { field: 'name' },
      subtitle: null,
      status: null,
    });
    expect(result.title).toBe('');
  });
});
