import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  IKARY_CONFIG_FILENAME,
  IkaryConfigError,
  loadIkaryConfig,
} from './load-ikary-config.js';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

// Re-import the mocked module so the tests can drive its behaviour.
import { existsSync, readFileSync } from 'node:fs';
const mockExists = existsSync as unknown as ReturnType<typeof vi.fn>;
const mockRead = readFileSync as unknown as ReturnType<typeof vi.fn>;

describe('loadIkaryConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns schema defaults when the file is absent', () => {
    mockExists.mockReturnValue(false);
    const cfg = loadIkaryConfig('/fake/cwd');
    expect(cfg.migrate?.packages).toEqual([]);
    expect(mockRead).not.toHaveBeenCalled();
  });

  it('reads and parses a valid config', () => {
    mockExists.mockReturnValue(true);
    mockRead.mockReturnValue(
      JSON.stringify({ migrate: { packages: ['@ikary/billing-core'] } }),
    );
    const cfg = loadIkaryConfig('/fake/cwd');
    expect(cfg.migrate?.packages).toEqual(['@ikary/billing-core']);
  });

  it('throws IkaryConfigError on malformed JSON', () => {
    mockExists.mockReturnValue(true);
    mockRead.mockReturnValue('{ this is: not json');
    expect(() => loadIkaryConfig('/fake/cwd')).toThrow(IkaryConfigError);
  });

  it('throws IkaryConfigError when a Zod validation fails', () => {
    mockExists.mockReturnValue(true);
    mockRead.mockReturnValue(
      JSON.stringify({ migrate: { packages: [''] } }),
    );
    try {
      loadIkaryConfig('/fake/cwd');
      expect.fail('expected throw');
    } catch (err) {
      expect(err).toBeInstanceOf(IkaryConfigError);
      expect((err as IkaryConfigError).message).toContain(IKARY_CONFIG_FILENAME);
      expect((err as IkaryConfigError).configPath).toContain(IKARY_CONFIG_FILENAME);
    }
  });

  it('includes the offending path in the ZodError message', () => {
    mockExists.mockReturnValue(true);
    mockRead.mockReturnValue(
      JSON.stringify({ migrate: { packages: 'not-an-array' } }),
    );
    try {
      loadIkaryConfig('/fake/cwd');
      expect.fail('expected throw');
    } catch (err) {
      expect((err as Error).message).toContain('migrate.packages');
    }
  });

  it('defaults to process.cwd() when no argument is provided', () => {
    mockExists.mockReturnValue(false);
    const cfg = loadIkaryConfig();
    expect(cfg.migrate?.packages).toEqual([]);
  });
});
