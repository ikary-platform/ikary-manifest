import { test, expect, vi } from 'vitest';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';

// Re-created per-test for SSO assertions; plain version kept for non-SSO tests.
const mockRes = { cookie: () => undefined, clearCookie: () => undefined } as never;
function makeMockRes() {
  return { cookie: vi.fn(), clearCookie: vi.fn() } as never;
}
const mockSsoSession = {
  createSession: async () => 'tok',
  validateSession: async () => null,
  revokeSession: async () => undefined,
} as never;

function createController(input: { signup: boolean; resetPassword: boolean }) {
  const authService = {
    signupClassic: () => 'signup-ok',
    loginClassic: () => 'login-ok',
    forgotPasswordClassic: () => 'forgot-ok',
    resetPasswordClassic: () => 'reset-ok',
  } as const;

  const authConfig = {
    config: {
      classic: {
        signup: input.signup,
        resetPassword: input.resetPassword,
      },
      cookie: { domain: 'localhost', secure: false },
    },
  };

  return new AuthController(authService as never, authConfig as never, mockSsoSession);
}

test('signup returns 404 when signup is disabled', async () => {
  const controller = createController({ signup: false, resetPassword: true });

  await expect(controller.signup({}, {}, '127.0.0.1', mockRes)).rejects.toThrow(NotFoundException);
});

test('forgot-password returns 404 when resetPassword is disabled', () => {
  const controller = createController({ signup: true, resetPassword: false });

  expect(() => controller.forgotPassword({}, {}, '127.0.0.1')).toThrow(NotFoundException);
});

test('reset-password returns 404 when resetPassword is disabled', () => {
  const controller = createController({ signup: true, resetPassword: false });

  expect(() => controller.resetPassword({}, {}, '127.0.0.1')).toThrow(NotFoundException);
});

test('login remains available when signup and resetPassword are disabled', async () => {
  const controller = createController({ signup: false, resetPassword: false });

  expect(await controller.login({}, {}, '127.0.0.1', mockRes)).toBe('login-ok');
});

// ── SSO endpoints ─────────────────────────────────────────────────────────────

function createSsoController(
  opts: {
    claims?: { userId: string; tenantId: string; workspaceId: string | null } | null;
    sessionResult?: unknown;
  } = {},
) {
  const authService = {
    signupClassic: () => 'signup-ok',
    loginClassic: () => 'login-ok',
    forgotPasswordClassic: () => 'forgot-ok',
    resetPasswordClassic: () => 'reset-ok',
    issueSessionFromSso: vi.fn().mockResolvedValue(opts.sessionResult ?? { tokens: { accessToken: 'access-tok' } }),
  };
  const authConfig = {
    config: {
      classic: { signup: true, resetPassword: true },
      cookie: { domain: 'localhost', secure: false },
    },
  };
  const ssoSession = {
    createSession: vi.fn().mockResolvedValue('sso-raw'),
    validateSession: vi.fn().mockResolvedValue(opts.claims ?? null),
    revokeSession: vi.fn().mockResolvedValue(undefined),
  };
  return {
    controller: new AuthController(authService as never, authConfig as never, ssoSession as never),
    ssoSession,
    authService,
  };
}

// ssoBootstrap

test('ssoBootstrap throws UnauthorizedException when rawToken is null', async () => {
  const { controller } = createSsoController();
  await expect(controller.ssoBootstrap(null, {}, '127.0.0.1', makeMockRes())).rejects.toThrow(UnauthorizedException);
});

test('ssoBootstrap throws UnauthorizedException when validateSession returns null', async () => {
  const { controller } = createSsoController({ claims: null });
  await expect(controller.ssoBootstrap('some-token', {}, '127.0.0.1', makeMockRes())).rejects.toThrow(
    UnauthorizedException,
  );
});

test('ssoBootstrap throws UnauthorizedException when claims have no workspaceId', async () => {
  const { controller } = createSsoController({
    claims: { userId: 'u1', tenantId: 't1', workspaceId: null },
  });
  await expect(controller.ssoBootstrap('some-token', {}, '127.0.0.1', makeMockRes())).rejects.toThrow(
    UnauthorizedException,
  );
});

test('ssoBootstrap returns the session result from issueSessionFromSso on valid claims', async () => {
  const expectedSession = { tokens: { accessToken: 'tok-abc' }, workspace: { id: 'w1' } };
  const { controller } = createSsoController({
    claims: { userId: 'u1', tenantId: 't1', workspaceId: 'w1' },
    sessionResult: expectedSession,
  });
  const result = await controller.ssoBootstrap('valid-token', {}, '127.0.0.1', makeMockRes());
  expect(result).toEqual(expectedSession);
});

test('ssoBootstrap slides the SSO cookie on success', async () => {
  const { controller } = createSsoController({
    claims: { userId: 'u1', tenantId: 't1', workspaceId: 'w1' },
  });
  const res = makeMockRes() as unknown as { cookie: ReturnType<typeof vi.fn>; clearCookie: ReturnType<typeof vi.fn> };
  await controller.ssoBootstrap('valid-token', {}, '127.0.0.1', res as never);
  expect(res.cookie).toHaveBeenCalledWith('ikary_sso', 'valid-token', expect.any(Object));
});

// logout

test('logout calls revokeSession when a raw token is present', async () => {
  const { controller, ssoSession } = createSsoController();
  await controller.logout('my-token', makeMockRes());
  expect(ssoSession.revokeSession).toHaveBeenCalledWith('my-token');
});

test('logout calls clearCookie regardless of rawToken', async () => {
  const { controller } = createSsoController();
  const res = makeMockRes() as unknown as { cookie: ReturnType<typeof vi.fn>; clearCookie: ReturnType<typeof vi.fn> };
  await controller.logout('my-token', res as never);
  expect(res.clearCookie).toHaveBeenCalledWith('ikary_sso', expect.any(Object));
});

test('logout does not throw when rawToken is null', async () => {
  const { controller } = createSsoController();
  await expect(controller.logout(null, makeMockRes())).resolves.not.toThrow();
});
