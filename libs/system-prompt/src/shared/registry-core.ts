import { PROMPT_ERROR_CODES, PromptRegistryError } from './error-codes';
import { parsePromptFile } from './frontmatter-parser';
import {
  promptMetadataSchema,
  type PromptArgument,
  type PromptMetadata,
} from './prompt-metadata.schema';
import { createPromptRenderer, type CompiledPromptTemplate } from './prompt-renderer';

export interface PromptDefinition {
  metadata: PromptMetadata;
  body: string;
  source: string;
}

export interface RegistryArgHook {
  (value: unknown, arg: PromptArgument, ctx: RenderContext): unknown;
}

export interface RenderContext {
  correlationId?: string;
  taskName?: string;
}

interface RegisteredEntry {
  definition: PromptDefinition;
  template: CompiledPromptTemplate;
}

export class PromptRegistry {
  private readonly entries = new Map<string, RegisteredEntry>();

  constructor(files: Record<string, string>) {
    const renderer = createPromptRenderer();
    for (const [filePath, raw] of Object.entries(files)) {
      const { frontmatter, body } = parsePromptFile(raw, filePath);
      const parsed = promptMetadataSchema.safeParse(frontmatter);
      if (!parsed.success) {
        throw new PromptRegistryError(
          PROMPT_ERROR_CODES.PROMPT_METADATA_INVALID,
          `Prompt frontmatter failed validation: ${filePath} (${parsed.error.message})`,
          { filePath, issues: parsed.error.issues },
        );
      }
      const metadata = parsed.data;
      if (this.entries.has(metadata.name)) {
        const existing = this.entries.get(metadata.name)!.definition.source;
        throw new PromptRegistryError(
          PROMPT_ERROR_CODES.PROMPT_DUPLICATE_NAME,
          `Duplicate prompt name "${metadata.name}" in ${filePath} (already registered from ${existing}).`,
          { name: metadata.name, filePath, existing },
        );
      }
      const definition: PromptDefinition = { metadata, body, source: filePath };
      const template = renderer.compile(body, metadata.name);
      this.entries.set(metadata.name, { definition, template });
    }
  }

  list(): PromptDefinition[] {
    return Array.from(this.entries.values()).map((entry) => entry.definition);
  }

  get(name: string): PromptDefinition {
    const entry = this.entries.get(name);
    if (!entry) {
      throw new PromptRegistryError(
        PROMPT_ERROR_CODES.PROMPT_NOT_FOUND,
        `Prompt not found: "${name}".`,
        { name },
      );
    }
    return entry.definition;
  }

  render(
    name: string,
    args: Record<string, unknown> = {},
    ctx: RenderContext = {},
    argHook?: RegistryArgHook,
  ): string {
    const entry = this.entries.get(name);
    if (!entry) {
      throw new PromptRegistryError(
        PROMPT_ERROR_CODES.PROMPT_NOT_FOUND,
        `Prompt not found: "${name}".`,
        { name },
      );
    }
    const processed = this.validateArgs(entry.definition.metadata, args, ctx, argHook);
    return entry.template.render(processed);
  }

  private validateArgs(
    metadata: PromptMetadata,
    args: Record<string, unknown>,
    ctx: RenderContext,
    argHook?: RegistryArgHook,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const arg of metadata.arguments) {
      const value = args[arg.name];
      if (value === undefined || value === null) {
        if (arg.required) {
          throw new PromptRegistryError(
            PROMPT_ERROR_CODES.PROMPT_ARG_MISSING,
            `Missing required argument "${arg.name}" for prompt "${metadata.name}".`,
            { name: metadata.name, arg: arg.name },
          );
        }
        continue;
      }
      assertArgType(value, arg, metadata.name);
      result[arg.name] = argHook ? argHook(value, arg, ctx) : value;
    }
    return result;
  }
}

function assertArgType(value: unknown, arg: PromptArgument, promptName: string): void {
  const actual = typeof value;
  const expected = arg.type;
  const ok =
    (expected === 'string' && actual === 'string') ||
    (expected === 'number' && actual === 'number' && Number.isFinite(value)) ||
    (expected === 'boolean' && actual === 'boolean') ||
    (expected === 'json' && (actual === 'object' || actual === 'string'));
  if (!ok) {
    throw new PromptRegistryError(
      PROMPT_ERROR_CODES.PROMPT_ARG_TYPE_INVALID,
      `Argument "${arg.name}" for prompt "${promptName}" expected ${expected} but received ${actual}.`,
      { promptName, arg: arg.name, expected, actual },
    );
  }
}
