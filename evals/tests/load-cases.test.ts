import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadCases } from '../core/load-cases';

describe('loadCases', () => {
  it('loads and validates eval cases from disk', async () => {
    const cases = await loadCases(resolve(process.cwd(), 'evals', 'cases'));
    expect(cases.length).toBeGreaterThanOrEqual(6);
    expect(cases.some((testCase) => testCase.id === 'create.task-tracker')).toBe(true);
  });
});
