# Auth Lib (`@ikary/system-auth`)

IAM-focused authentication library for NestJS + PostgreSQL.

Scope of this package:

- Identity and authentication only
- Multi-tenant isolation (`workspace_id`)
- JWT access + refresh with rotation
- Classic email/password auth (v1)
- Per-app public auth capability flags
- Email verification (`code` or `click`)
- Forgot/reset password
- Optional magic link
- Zod validation and raw SQL migrations

Out of scope by design:

- Authorization policy engine and access-control rules
- Access-control guards

## Package Kind

This package is a server library. It exports Node/NestJS runtime functionality from the package root only.

## 1. Installation

```bash
cd libs/system-auth
pnpm install --ignore-workspace
pnpm build
```

Install in host app:

```bash
pnpm add @ikary/system-auth
```

This library intentionally uses pure-JS `bcryptjs` for bcrypt-format password hashing so local, CI, and production installs do not depend on native addon bindings.

## 2. Run Migrations

```bash
cd libs/system-auth
export DATABASE_URL='postgres://user:pass@localhost:5432/app'
pnpm migrate
```

Migrations are incremental and tracked in `schema_migrations`.
Naming convention is `NNN_<module>_<domain>_<action>.sql` so ordering and ownership stay explicit across many modules.
Migration files `004` and `005` are intentional no-op placeholders to keep versioned migration order stable.

Current `v1.0.0` files:

- `001_auth_user_create_users.sql`
- `002_auth_organization_create_organizations.sql`
- `003_auth_membership_create_memberships.sql`
- `004_auth_core_reserved_slot_004.sql`
- `005_auth_core_reserved_slot_005.sql`
- `006_auth_audit_create_audit_logs.sql`

Current IAM schema tables:

- `users`
- `workspaces`
- `workspace_members`
- `refresh_tokens`
- `email_verification_tokens`
- `password_reset_tokens`
- `magic_link_tokens`
- `audit_logs`

## 3. AuthModule Configuration

```ts
import { Module } from '@nestjs/common';
import { AuthModule } from '@ikary/system-auth';

@Module({
  imports: [
    AuthModule.register({
      database: {
        connectionString: process.env.DATABASE_URL!,
        ssl: false,
        maxPoolSize: 20,
      },
      jwt: {
        accessTokenSecret: process.env.AUTH_ACCESS_TOKEN_SECRET!,
        refreshTokenSecret: process.env.AUTH_REFRESH_TOKEN_SECRET!,
        tokenHashSecret: process.env.AUTH_TOKEN_HASH_SECRET!,
        accessTokenTtlSeconds: 900,
        refreshTokenTtlSeconds: 60 * 60 * 24 * 14,
        issuer: 'your-saas',
        audience: 'your-saas-clients',
      },
      classic: {
        enabled: true,
        signup: true,
        resetPassword: true,
        magicLink: false,
        emailVerification: 'code',
        requireEmailVerification: true,
        passwordMinLength: 8,
        verificationCodeLength: 6,
        verificationTokenTtlMinutes: 20,
        resetPasswordTtlMinutes: 30,
        magicLinkTtlMinutes: 15,
      },
      github: { enabled: false, clientId: '' },
      google: { enabled: false, clientId: '' },
      sso: { enabled: false },
      okta: { enabled: false },
    }),
  ],
})
export class AppModule {}
```

Requested shape example:

```ts
AuthModule.register({
  database: { connectionString: process.env.DATABASE_URL! },
  jwt: {
    accessTokenSecret: process.env.AUTH_ACCESS_TOKEN_SECRET!,
    refreshTokenSecret: process.env.AUTH_REFRESH_TOKEN_SECRET!,
    tokenHashSecret: process.env.AUTH_TOKEN_HASH_SECRET!,
  },
  classic: {
    enabled: true,
    signup: true,
    resetPassword: true,
    magicLink: false,
    emailVerification: 'code',
    passwordMinLength: 8,
  },
  github: { enabled: false, clientId: '' },
  google: { enabled: false, clientId: '' },
  sso: { enabled: false },
  okta: { enabled: false },
});
```

## 4. Endpoints (Classic)

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/verify-email`
- `POST /auth/magic-link/request`
- `POST /auth/magic-link/consume`

Capability flags:

- `classic.signup = false` makes `POST /auth/signup` return `404`
- `classic.resetPassword = false` makes both `POST /auth/forgot-password` and `POST /auth/reset-password` return `404`

This keeps the route shape stable in the shared controller while allowing each app to disable public self-service flows.

## 5. Multi-Tenant Isolation

1. Protected requests require `x-workspace-id`.
2. JWT contains `user_id` and `workspace_id` and guard verifies tenant match.
3. Tenant-owned tables carry `workspace_id` and repository queries use tenant predicates.
4. Active membership in `memberships` is required to access tenant context.

## 6. Protected Endpoint Example

```ts
import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard, WorkspaceGuard, AuditInterceptor, CurrentAuth } from '@ikary/system-auth';

@Controller('tenant')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@UseInterceptors(AuditInterceptor)
export class TenantController {
  @Get('me')
  me(@CurrentAuth() auth: { userId: string; workspaceId: string }) {
    return { ok: true, auth };
  }
}
```

## 7. Security Assumptions

- Passwords are stored as bcrypt-format hashes via `bcryptjs`.
- Refresh tokens are hashed before storage.
- Verification/reset/magic tokens are hashed before storage.
- Refresh token rotation revokes prior refresh token.
- Password reset revokes refresh sessions for that tenant.
- Production must run over HTTPS.

## 8. Extending Providers (GitHub/Google/SSO/Okta)

Provider extension contract:

```ts
interface AuthProvider {
  provider: 'classic' | 'github' | 'google' | 'sso' | 'okta';
  signup(input: unknown, context: AuthContext): Promise<SignupResult>;
  login(input: unknown, context: AuthContext): Promise<LoginResult>;
  refresh(input: unknown, context: AuthContext): Promise<LoginResult>;
  forgotPassword(input: unknown, context: AuthContext): Promise<void>;
  resetPassword(input: unknown, context: AuthContext): Promise<void>;
  verifyEmail(input: unknown, context: AuthContext): Promise<void>;
}
```

Add new providers under `src/providers/<name>/` and register in `AuthModule` behind `enabled` config flags.

## 9. Trusted Provisioning

Trusted server-side provisioning is available for bootstrap flows that must not depend on public signup.

```ts
import { AuthProvisioningService } from '@ikary/system-auth';

await authProvisioningService.provisionClassicUser({
  email: 'admin@example.com',
  password: 'replace-with-a-strong-password',
  workspaceName: 'Ikary API',
  workspaceSlug: 'ikary-api',
  markEmailVerified: true,
});
```

Notes:

- this service is internal/server-side only
- it does not depend on `classic.signup`
- it still honors the shared password policy
- it is idempotent only for the exact same user + workspace target

## 10. Versioning and Breaking Changes

- Migrations are versioned under `migrations/vX.Y.Z/`.
- Existing migration files are immutable after release.
- Breaking changes require major version bump.

Breaking examples:

- Public TypeScript contract changes
- Endpoint contract changes
- JWT claim contract changes (`user_id`, `workspace_id`)
- Tenant isolation invariant changes

## 11. Commands

```bash
cd libs/system-auth
pnpm typecheck
pnpm build
pnpm migrate
```
