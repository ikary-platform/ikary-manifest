import { describe, it, expect, vi } from 'vitest';
import { createCellComponentRegistry } from './cell-component-registry';
import type { PageRendererComponent } from './cell-component-registry';

describe('createCellComponentRegistry', () => {
  it('registers and resolves a page renderer', () => {
    const registry = createCellComponentRegistry();
    const renderer = vi.fn() as unknown as PageRendererComponent;
    registry.register('entity-list', renderer);
    expect(registry.resolve('entity-list')).toBe(renderer);
  });

  it('throws when resolving an unregistered page type', () => {
    const registry = createCellComponentRegistry();
    expect(() => registry.resolve('entity-list')).toThrow(
      'No renderer registered for page type: entity-list',
    );
  });

  it('allows overwriting a registered renderer', () => {
    const registry = createCellComponentRegistry();
    const first = vi.fn() as unknown as PageRendererComponent;
    const second = vi.fn() as unknown as PageRendererComponent;
    registry.register('entity-list', first);
    registry.register('entity-list', second);
    expect(registry.resolve('entity-list')).toBe(second);
  });
});
