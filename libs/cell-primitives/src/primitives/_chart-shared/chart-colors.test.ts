import { describe, it, expect } from 'vitest';
import { resolveChartColors } from './chart-colors';

describe('resolveChartColors', () => {
  it('returns palette colours when no user colours are provided', () => {
    const colors = resolveChartColors(3);
    expect(colors).toHaveLength(3);
    expect(colors[0]).toBe('hsl(var(--chart-1))');
    expect(colors[1]).toBe('hsl(var(--chart-2))');
    expect(colors[2]).toBe('hsl(var(--chart-3))');
  });

  it('uses user-supplied colours when provided', () => {
    const colors = resolveChartColors(2, ['#ff0000', '#00ff00']);
    expect(colors[0]).toBe('#ff0000');
    expect(colors[1]).toBe('#00ff00');
  });

  it('falls back to palette when user colour is undefined', () => {
    const colors = resolveChartColors(2, [undefined, '#abc']);
    expect(colors[0]).toBe('hsl(var(--chart-1))');
    expect(colors[1]).toBe('#abc');
  });

  it('wraps around the palette when count exceeds 5', () => {
    const colors = resolveChartColors(6);
    expect(colors[5]).toBe('hsl(var(--chart-1))');
  });

  it('returns an empty array for count 0', () => {
    expect(resolveChartColors(0)).toEqual([]);
  });
});
