export type PromptTemplateValue = string | number | boolean | null | undefined;
export type PromptTemplateContext = Record<string, PromptTemplateValue>;

const TOKEN_PATTERN = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

/**
 * Goal: Render prompt templates with explicit named placeholders.
 * Missing placeholders fail fast to avoid hidden prompt drift.
 */
export function renderPromptTemplate(template: string, context: PromptTemplateContext): string {
  return template.replace(TOKEN_PATTERN, (_match, key: string) => {
    if (!(key in context)) {
      throw new Error(`Missing template placeholder: ${key}`);
    }

    const value = context[key];
    return value === null || value === undefined ? '' : String(value);
  });
}
