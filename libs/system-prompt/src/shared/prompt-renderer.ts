import Handlebars from 'handlebars';
import { PROMPT_ERROR_CODES, PromptRegistryError } from './error-codes';

export interface CompiledPromptTemplate {
  render(args: Record<string, unknown>): string;
}

export function createPromptRenderer(): {
  compile(body: string, name: string): CompiledPromptTemplate;
} {
  const env = Handlebars.create();
  env.registerHelper('eq', (a: unknown, b: unknown) => a === b);

  return {
    compile(body, name) {
      const template = env.compile(body, { strict: true, noEscape: true });
      return {
        render(args) {
          try {
            return template(args);
          } catch (err) {
            throw new PromptRegistryError(
              PROMPT_ERROR_CODES.PROMPT_RENDER_FAILED,
              `Failed to render prompt "${name}": ${(err as Error).message}`,
              { name },
            );
          }
        },
      };
    },
  };
}
