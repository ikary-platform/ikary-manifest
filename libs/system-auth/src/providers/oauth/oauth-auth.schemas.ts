import { z } from 'zod';

export const oauthCallbackSchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});

export const oauthInitiateSchema = z.object({
  redirectUri: z.string().optional(),
  signupIntent: z
    .object({
      workspaceName: z.string().optional(),
      workspaceSlug: z.string().optional(),
    })
    .optional(),
});

export type OAuthCallbackInput = z.infer<typeof oauthCallbackSchema>;
export type OAuthInitiateInput = z.infer<typeof oauthInitiateSchema>;
