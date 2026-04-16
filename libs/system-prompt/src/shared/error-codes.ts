export const PROMPT_ERROR_CODES = {
  PROMPT_NOT_FOUND: 'PROMPT_NOT_FOUND',
  PROMPT_METADATA_INVALID: 'PROMPT_METADATA_INVALID',
  PROMPT_FRONTMATTER_INVALID: 'PROMPT_FRONTMATTER_INVALID',
  PROMPT_DUPLICATE_NAME: 'PROMPT_DUPLICATE_NAME',
  PROMPT_ARG_MISSING: 'PROMPT_ARG_MISSING',
  PROMPT_ARG_TYPE_INVALID: 'PROMPT_ARG_TYPE_INVALID',
  PROMPT_RENDER_FAILED: 'PROMPT_RENDER_FAILED',
} as const;

export type PromptErrorCode = (typeof PROMPT_ERROR_CODES)[keyof typeof PROMPT_ERROR_CODES];

export class PromptRegistryError extends Error {
  constructor(
    public readonly code: PromptErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'PromptRegistryError';
  }
}
