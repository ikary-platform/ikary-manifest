import { test, expect } from 'vitest';
import { authModuleOptionsSchema } from './auth-options.schema';

test('auth module options apply classic public-flow defaults', () => {
  const parsed = authModuleOptionsSchema.parse({
    database: {
      connectionString: 'postgres://example',
    },
    jwt: {
      accessTokenSecret: 'a'.repeat(32),
      refreshTokenSecret: 'b'.repeat(32),
      tokenHashSecret: 'c'.repeat(32),
    },
    cookie: {
      domain: 'localhost',
    },
  });

  expect(parsed.classic.enabled).toBe(true);
  expect(parsed.classic.signup).toBe(true);
  expect(parsed.classic.resetPassword).toBe(true);
  expect(parsed.classic.magicLink).toBe(false);
});
