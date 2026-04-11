import { describe, expect, it } from 'vitest';
import { CodeNormalizerService } from './code-normalizer.service';

describe('CodeNormalizerService', () => {
  const service = new (CodeNormalizerService as any)() as CodeNormalizerService;

  describe('normalization', () => {
    it('uppercases a lowercase code', () => {
      expect(service.normalizeScopeCode('workspace_create')).toBe('WORKSPACE_CREATE');
    });

    it('uppercases a mixed-case code', () => {
      expect(service.normalizeScopeCode('Workspace_Create')).toBe('WORKSPACE_CREATE');
    });

    it('trims leading and trailing whitespace', () => {
      expect(service.normalizeScopeCode('  FOO  ')).toBe('FOO');
    });

    it('returns an already-uppercase code unchanged', () => {
      expect(service.normalizeScopeCode('FEATURE_X')).toBe('FEATURE_X');
    });
  });

  describe('valid codes', () => {
    it('accepts alphanumeric codes', () => {
      expect(service.normalizeScopeCode('ABC123')).toBe('ABC123');
    });

    it('accepts codes with dots', () => {
      expect(service.normalizeScopeCode('scope.read')).toBe('SCOPE.READ');
    });

    it('accepts codes with colons', () => {
      expect(service.normalizeScopeCode('scope:read')).toBe('SCOPE:READ');
    });

    it('accepts codes with hyphens', () => {
      expect(service.normalizeScopeCode('scope-read')).toBe('SCOPE-READ');
    });

    it('accepts codes with underscores', () => {
      expect(service.normalizeScopeCode('scope_read')).toBe('SCOPE_READ');
    });

    it('accepts a single-character code', () => {
      expect(service.normalizeScopeCode('A')).toBe('A');
    });

    it('accepts a code at max length (150 chars)', () => {
      const code = 'A'.repeat(150);
      expect(service.normalizeScopeCode(code)).toBe(code);
    });
  });

  describe('invalid codes', () => {
    it('throws on an empty string', () => {
      expect(() => service.normalizeScopeCode('')).toThrow();
    });

    it('throws on a whitespace-only string (empty after trim)', () => {
      expect(() => service.normalizeScopeCode('   ')).toThrow();
    });

    it('throws on a code exceeding 150 characters', () => {
      const code = 'A'.repeat(151);
      expect(() => service.normalizeScopeCode(code)).toThrow();
    });

    it('throws on a code with spaces', () => {
      expect(() => service.normalizeScopeCode('SCOPE READ')).toThrow();
    });

    it('throws on a code with special characters (!)', () => {
      expect(() => service.normalizeScopeCode('SCOPE!')).toThrow();
    });

    it('throws on a code with @', () => {
      expect(() => service.normalizeScopeCode('SCOPE@READ')).toThrow();
    });

    it('throws on a code with #', () => {
      expect(() => service.normalizeScopeCode('SCOPE#READ')).toThrow();
    });

    it('throws on a code with slash', () => {
      expect(() => service.normalizeScopeCode('scope/read')).toThrow();
    });
  });
});
