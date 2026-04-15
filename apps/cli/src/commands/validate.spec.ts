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
  loadManifestJson: vi.fn(),
}));

vi.mock('../api/index.js', () => ({
  api: { explainErrors: vi.fn().mockResolvedValue({ ok: false, data: [] }) },
  withApiFallback: vi.fn((primary, fallback) => fallback()),
}));

// ── Helpers ────────────────────────────────────────────────────────────────

function makeSpinner() {
  return { start: vi.fn(), succeed: vi.fn(), fail: vi.fn(), warn: vi.fn(), info: vi.fn(), text: '' };
}

let mockSpinner: ReturnType<typeof makeSpinner>;
let originalExitCode: number | undefined;

beforeEach(() => {
  originalExitCode = process.exitCode as number | undefined;
  process.exitCode = undefined;
  mockSpinner = makeSpinner();
  vi.mocked(fmt.createSpinner).mockReturnValue(mockSpinner as any);
});

afterEach(() => {
  process.exitCode = originalExitCode;
  vi.clearAllMocks();
});

const { validateCommand } = await import('./validate.js');

// ── Tests ──────────────────────────────────────────────────────────────────

describe('validateCommand', () => {
  describe('valid manifest', () => {
    it('calls spinner.succeed when manifest is valid', async () => {
      vi.mocked(manifestLoader.loadManifestJson).mockResolvedValue({
        valid: true,
        manifest: { spec: { entities: [{}, {}], pages: [{}], roles: [] } },
        errors: [],
      });

      await validateCommand('manifest.json', {});

      expect(mockSpinner.succeed).toHaveBeenCalledWith(expect.stringContaining('valid'));
      expect(process.exitCode).toBeUndefined();
    });

    it('prints entity, page, and role counts from the manifest', async () => {
      vi.mocked(manifestLoader.loadManifestJson).mockResolvedValue({
        valid: true,
        manifest: { spec: { entities: [{}, {}, {}], pages: [{}, {}], roles: [{}] } },
        errors: [],
      });

      await validateCommand('manifest.json', {});

      const bodyCalls = vi.mocked(fmt.body).mock.calls.map(([s]) => s);
      expect(bodyCalls.some((s) => s.includes('3'))).toBe(true); // entities
      expect(bodyCalls.some((s) => s.includes('2'))).toBe(true); // pages
    });

    it('handles missing spec sections gracefully (counts as 0)', async () => {
      vi.mocked(manifestLoader.loadManifestJson).mockResolvedValue({
        valid: true,
        manifest: { spec: {} },
        errors: [],
      });

      await validateCommand('manifest.json', {});

      expect(mockSpinner.succeed).toHaveBeenCalled();
      expect(process.exitCode).toBeUndefined();
    });
  });

  describe('invalid manifest', () => {
    it('calls spinner.fail when manifest has errors', async () => {
      vi.mocked(manifestLoader.loadManifestJson).mockResolvedValue({
        valid: false,
        errors: [
          { path: 'spec.entities[0].key', message: 'Required' },
          { path: 'spec.entities[0].name', message: 'Required' },
        ],
      });

      await validateCommand('manifest.json', {});

      expect(mockSpinner.fail).toHaveBeenCalledWith(expect.stringContaining('2 error'));
      expect(process.exitCode).toBe(1);
    });

    it('prints an error line for each validation error', async () => {
      vi.mocked(manifestLoader.loadManifestJson).mockResolvedValue({
        valid: false,
        errors: [
          { path: 'spec.entities[0].key', message: 'Required' },
          { path: 'metadata.name', message: 'Too short' },
        ],
      });

      await validateCommand('manifest.json', {});

      expect(vi.mocked(fmt.error)).toHaveBeenCalledTimes(2);
    });

    it('uses "root" as location when error path is empty', async () => {
      vi.mocked(manifestLoader.loadManifestJson).mockResolvedValue({
        valid: false,
        errors: [{ path: '', message: 'Schema mismatch' }],
      });

      await validateCommand('manifest.json', {});

      const [msg] = vi.mocked(fmt.error).mock.calls[0]!;
      expect(msg).toContain('root');
    });
  });

  describe('error handling', () => {
    it('calls spinner.fail and sets exitCode when loader throws', async () => {
      vi.mocked(manifestLoader.loadManifestJson).mockRejectedValue(
        new Error('File not found'),
      );

      await validateCommand('nonexistent.json', {});

      expect(mockSpinner.fail).toHaveBeenCalled();
      expect(vi.mocked(fmt.error)).toHaveBeenCalledWith(expect.stringContaining('File not found'));
      expect(process.exitCode).toBe(1);
    });
  });
});
