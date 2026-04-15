import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fmt from '../output/format.js';
import * as manifestLoader from '../utils/manifest-loader.js';

// ── Module mocks ───────────────────────────────────────────────────────────

vi.mock('../output/format.js', () => ({
  section: vi.fn(),
  muted: vi.fn(),
  body: vi.fn(),
  newline: vi.fn(),
  error: vi.fn(),
  success: vi.fn(),
  info: vi.fn(),
  createSpinner: vi.fn(),
}));

vi.mock('../output/theme.js', () => ({
  theme: {
    body: (s: string) => s,
    success: (s: string) => s,
    error: (s: string) => s,
    muted: (s: string) => s,
    accent: (s: string) => s,
    section: (s: string) => s,
    bold: (s: string) => s,
  },
}));

vi.mock('../utils/manifest-loader.js', () => ({
  compileManifestJson: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

// ── Helpers ────────────────────────────────────────────────────────────────

function makeSpinner() {
  return { start: vi.fn(), succeed: vi.fn(), fail: vi.fn(), warn: vi.fn(), info: vi.fn(), text: '' };
}

let mockSpinner: ReturnType<typeof makeSpinner>;
let originalExitCode: number | undefined;
let consoleLogSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  originalExitCode = process.exitCode as number | undefined;
  process.exitCode = undefined;
  mockSpinner = makeSpinner();
  vi.mocked(fmt.createSpinner).mockReturnValue(mockSpinner as any);
  consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  process.exitCode = originalExitCode;
  consoleLogSpy.mockRestore();
  vi.clearAllMocks();
});

const { compileCommand } = await import('./compile.js');
const { writeFile } = await import('node:fs/promises');

// ── Tests ──────────────────────────────────────────────────────────────────

describe('compileCommand', () => {
  const compiledManifest = { apiVersion: 'ikary.co/v1alpha1', kind: 'Cell' };

  describe('successful compilation', () => {
    beforeEach(() => {
      vi.mocked(manifestLoader.compileManifestJson).mockResolvedValue({
        valid: true,
        manifest: compiledManifest,
        compiled: compiledManifest,
        errors: [],
      });
    });

    it('calls spinner.succeed when compilation succeeds', async () => {
      await compileCommand('manifest.json', { stdout: true });

      expect(mockSpinner.succeed).toHaveBeenCalledWith(expect.stringContaining('Compiled'));
      expect(process.exitCode).toBeUndefined();
    });

    it('prints compiled JSON to stdout when --stdout flag is set', async () => {
      await compileCommand('manifest.json', { stdout: true });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        JSON.stringify(compiledManifest, null, 2),
      );
    });

    it('writes compiled JSON to the default output path when no options given', async () => {
      await compileCommand('/project/manifest.json', {});

      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        expect.stringContaining('manifest.compiled.json'),
        JSON.stringify(compiledManifest, null, 2),
        'utf-8',
      );
    });

    it('writes to the explicit --output path when provided', async () => {
      await compileCommand('manifest.json', { output: '/out/compiled.json' });

      expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
        expect.stringContaining('compiled.json'),
        expect.any(String),
        'utf-8',
      );
    });

    it('does not call writeFile when --stdout is set', async () => {
      await compileCommand('manifest.json', { stdout: true });

      expect(vi.mocked(writeFile)).not.toHaveBeenCalled();
    });
  });

  describe('failed compilation', () => {
    it('calls spinner.fail and sets exitCode when compilation has errors', async () => {
      vi.mocked(manifestLoader.compileManifestJson).mockResolvedValue({
        valid: false,
        errors: [
          { path: 'spec.entities[0].fields', message: 'At least one field required' },
        ],
      });

      await compileCommand('manifest.json', {});

      expect(mockSpinner.fail).toHaveBeenCalledWith(expect.stringContaining('1 error'));
      expect(process.exitCode).toBe(1);
    });

    it('prints each compilation error via fmt.error', async () => {
      vi.mocked(manifestLoader.compileManifestJson).mockResolvedValue({
        valid: false,
        errors: [
          { path: 'spec.entities[0].key', message: 'Invalid key' },
          { path: 'spec.entities[0].name', message: 'Required' },
        ],
      });

      await compileCommand('manifest.json', {});

      expect(vi.mocked(fmt.error)).toHaveBeenCalledTimes(2);
    });

    it('does not call writeFile when compilation fails', async () => {
      vi.mocked(manifestLoader.compileManifestJson).mockResolvedValue({
        valid: false,
        errors: [{ path: '', message: 'Invalid' }],
      });

      await compileCommand('manifest.json', {});

      expect(vi.mocked(writeFile)).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('calls spinner.fail and sets exitCode when compileManifestJson throws', async () => {
      vi.mocked(manifestLoader.compileManifestJson).mockRejectedValue(
        new Error('YAML parse error'),
      );

      await compileCommand('bad.yaml', {});

      expect(mockSpinner.fail).toHaveBeenCalled();
      expect(vi.mocked(fmt.error)).toHaveBeenCalledWith(
        expect.stringContaining('YAML parse error'),
      );
      expect(process.exitCode).toBe(1);
    });
  });
});
