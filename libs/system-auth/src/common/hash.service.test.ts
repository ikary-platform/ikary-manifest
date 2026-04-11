import { test, expect } from 'vitest';
import { HashService } from './hash.service';

const service = new HashService();
const fixturePassword = 'micro-auth-password';
const fixtureHash = '$2a$12$s5KknJniB5PPngo.vGJ2c.d.maVjG6gG9OXebwqejOCgI8Qv3nJ1K';

test('hashPassword returns a bcrypt-format hash', async () => {
  const hash = await service.hashPassword(fixturePassword);

  expect(hash).not.toBe(fixturePassword);
  expect(hash).toMatch(/^\$2[aby]\$/);
});

test('verifyPassword succeeds for a freshly hashed password', async () => {
  const hash = await service.hashPassword(fixturePassword);
  const matches = await service.verifyPassword(fixturePassword, hash);

  expect(matches).toBe(true);
});

test('verifyPassword fails for the wrong password', async () => {
  const hash = await service.hashPassword(fixturePassword);
  const matches = await service.verifyPassword('wrong-password', hash);

  expect(matches).toBe(false);
});

test('verifyPassword supports an existing bcrypt-format fixture hash', async () => {
  const matches = await service.verifyPassword(fixturePassword, fixtureHash);

  expect(matches).toBe(true);
});

test('hashOpaqueToken is deterministic for the same inputs', () => {
  const token = 'opaque-token';
  const secret = 'opaque-secret';

  expect(service.hashOpaqueToken(token, secret)).toBe(service.hashOpaqueToken(token, secret));
});

test('generateOpaqueToken returns a url-safe token', () => {
  const token = service.generateOpaqueToken();

  expect(token.length).toBeGreaterThan(0);
  expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
});

test('generateNumericCode returns the requested numeric length', () => {
  const code = service.generateNumericCode(8);

  expect(code.length).toBe(8);
  expect(code).toMatch(/^\d{8}$/);
});
