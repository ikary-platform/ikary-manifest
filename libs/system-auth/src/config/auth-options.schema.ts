import { z } from 'zod';

export const providerToggleWithClientIdSchema = z
  .object({
    enabled: z.boolean().default(false),
    clientId: z.string().default(''),
  })
  .superRefine((value, ctx) => {
    if (value.enabled && value.clientId.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['clientId'],
        message: 'clientId is required when the provider is enabled.',
      });
    }
  });

export const oauthProviderConfigSchema = providerToggleWithClientIdSchema
  .and(
    z.object({
      clientSecret: z.string().default(''),
      callbackUrl: z.string().default(''),
      allowSignup: z.boolean().default(true),
      autoLinkByEmail: z.boolean().default(true),
    }),
  )
  .superRefine((value, ctx) => {
    if (value.enabled && value.clientSecret.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['clientSecret'],
        message: 'clientSecret is required when the provider is enabled.',
      });
    }
  });

export const classicProviderConfigSchema = z.object({
  enabled: z.boolean().default(true),
  signup: z.boolean().default(true),
  resetPassword: z.boolean().default(true),
  magicLink: z.boolean().default(false),
  emailVerification: z.enum(['code', 'click']).default('code'),
  requireEmailVerification: z.boolean().default(true),
  passwordMinLength: z.number().int().min(8).max(128).default(8),
  verificationCodeLength: z.number().int().min(4).max(12).default(6),
  verificationTokenTtlMinutes: z.number().int().min(1).max(1440).default(20),
  resetPasswordTtlMinutes: z.number().int().min(5).max(1440).default(30),
  magicLinkTtlMinutes: z.number().int().min(1).max(240).default(15),
});

export const jwtConfigSchema = z.object({
  accessTokenSecret: z.string().min(32),
  refreshTokenSecret: z.string().min(32),
  tokenHashSecret: z.string().min(32),
  accessTokenTtlSeconds: z.number().int().min(60).max(3600).default(900),
  refreshTokenTtlSeconds: z
    .number()
    .int()
    .min(3600)
    .max(60 * 60 * 24 * 30)
    .default(60 * 60 * 24 * 14),
  issuer: z.string().min(1).default('auth-lib'),
  audience: z.string().min(1).default('auth-lib-clients'),
});

export const databaseConfigSchema = z.object({
  connectionString: z.string().min(1),
  ssl: z.boolean().default(false),
  maxPoolSize: z.number().int().min(1).max(100).default(20),
});

export const cookieConfigSchema = z.object({
  /** Cookie domain — `localhost` for dev, `.yourcompany.com` for production. */
  domain: z.string().min(1),
  /** Set the `Secure` flag on the SSO cookie. Defaults to true in production. */
  secure: z.boolean().default(false),
});

export const authModuleOptionsSchema = z.object({
  database: databaseConfigSchema,
  jwt: jwtConfigSchema,
  classic: classicProviderConfigSchema.default({}),
  github: oauthProviderConfigSchema.default({}),
  google: oauthProviderConfigSchema.default({}),
  sso: z.object({ enabled: z.boolean().default(false) }).default({}),
  okta: z.object({ enabled: z.boolean().default(false) }).default({}),
  cookie: cookieConfigSchema,
});

export type AuthModuleOptions = z.infer<typeof authModuleOptionsSchema>;
export type ClassicProviderConfig = z.infer<typeof classicProviderConfigSchema>;
export type OAuthProviderConfig = z.infer<typeof oauthProviderConfigSchema>;
export type CookieConfig = z.infer<typeof cookieConfigSchema>;
