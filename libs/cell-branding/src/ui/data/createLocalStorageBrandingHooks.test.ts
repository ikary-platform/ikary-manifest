import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createLocalStorageBrandingHooks } from './createLocalStorageBrandingHooks.js';

describe('createLocalStorageBrandingHooks', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('returns a stable snapshot reference across renders when storage is unchanged', () => {
    const hooks = createLocalStorageBrandingHooks({ storageKey: 'test' });
    const { result, rerender } = renderHook(() => hooks.useBranding('cell-a'));

    const first = result.current[0];
    rerender();
    const second = result.current[0];
    rerender();
    const third = result.current[0];

    expect(first).toBe(second);
    expect(second).toBe(third);
  });

  it('writes and reads a patch', async () => {
    const hooks = createLocalStorageBrandingHooks({ storageKey: 'test' });
    const { result } = renderHook(() => {
      const read = hooks.useBranding('cell-a');
      const update = hooks.useUpdateBranding();
      return { read, update };
    });

    await act(async () => {
      await result.current.update('cell-a', {
        expectedVersion: 0,
        accentColor: '#16A34A',
      });
    });

    const [branding] = result.current.read;
    expect(branding?.accentColor).toBe('#16A34A');
    expect(branding?.version).toBe(1);
    expect(branding?.isCustomized).toBe(true);
  });

  it('throws on version conflict', async () => {
    const hooks = createLocalStorageBrandingHooks({ storageKey: 'test' });
    const { result } = renderHook(() => hooks.useUpdateBranding());

    await act(async () => {
      await result.current('cell-a', { expectedVersion: 0, accentColor: '#000000' });
    });

    await expect(
      result.current('cell-a', { expectedVersion: 0, accentColor: '#FFFFFF' }),
    ).rejects.toThrow(/version conflict/i);
  });

  it('reset clears overrides and increments version', async () => {
    const hooks = createLocalStorageBrandingHooks({ storageKey: 'test' });
    const { result } = renderHook(() => {
      const read = hooks.useBranding('cell-a');
      const update = hooks.useUpdateBranding();
      const reset = hooks.useResetBranding();
      return { read, update, reset };
    });

    await act(async () => {
      await result.current.update('cell-a', {
        expectedVersion: 0,
        accentColor: '#FF0000',
      });
    });

    await act(async () => {
      await result.current.reset('cell-a', { expectedVersion: 1 });
    });

    const [branding] = result.current.read;
    expect(branding?.accentColor).toBeNull();
    expect(branding?.isCustomized).toBe(false);
  });
});
