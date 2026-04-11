import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .email()
  .transform((value) => value.toLowerCase());
const workspaceIdSchema = z.string().uuid();

export const signupSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
  workspaceName: z.string().trim().min(2).max(255),
  workspaceSlug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]{3,120}$/)
    .optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
  tenantSlug: z.string().trim().toLowerCase().min(1).optional(),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(20),
});

export const selectWorkspaceSchema = z.object({
  workspaceId: workspaceIdSchema,
  selectionToken: z.string().min(20),
});

export const switchWorkspaceSchema = z.object({
  workspaceId: workspaceIdSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
  workspaceId: workspaceIdSchema.optional(),
});

export const resetPasswordSchema = z.object({
  workspaceId: workspaceIdSchema.optional(),
  token: z.string().min(20),
  newPassword: z.string().min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(1),
});

export const verifyEmailSchema = z
  .object({
    email: emailSchema,
    workspaceId: workspaceIdSchema,
    code: z.string().trim().min(4).max(12).optional(),
    token: z.string().trim().min(20).optional(),
  })
  .refine((input) => Boolean(input.code || input.token), {
    message: 'code or token must be provided.',
  });

export const requestMagicLinkSchema = z.object({
  email: emailSchema,
  workspaceId: workspaceIdSchema,
});

export const consumeMagicLinkSchema = z.object({
  workspaceId: workspaceIdSchema,
  token: z.string().min(20),
});

export const initiateSignupSchema = z.object({
  email: emailSchema,
});

export const completeSignupSchema = z.object({
  email: emailSchema,
  code: z.string().trim().length(6),
  password: z.string().min(1),
  workspaceSlug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]{3,120}$/)
    .optional(),
});
