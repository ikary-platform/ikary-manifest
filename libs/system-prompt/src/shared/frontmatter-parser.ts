import { parse as parseYaml } from 'yaml';
import { PROMPT_ERROR_CODES, PromptRegistryError } from './error-codes';

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;

export interface ParsedPromptFile {
  frontmatter: Record<string, unknown>;
  body: string;
}

export function parsePromptFile(source: string, filePath: string): ParsedPromptFile {
  const match = FRONTMATTER_PATTERN.exec(source);
  if (!match) {
    throw new PromptRegistryError(
      PROMPT_ERROR_CODES.PROMPT_FRONTMATTER_INVALID,
      `Prompt file is missing a YAML frontmatter block delimited by --- fences: ${filePath}`,
      { filePath },
    );
  }

  const [, yamlText, body] = match;
  if (body.trim().length === 0) {
    throw new PromptRegistryError(
      PROMPT_ERROR_CODES.PROMPT_FRONTMATTER_INVALID,
      `Prompt file has an empty body after frontmatter: ${filePath}`,
      { filePath },
    );
  }

  let frontmatter: unknown;
  try {
    frontmatter = parseYaml(yamlText);
  } catch (err) {
    throw new PromptRegistryError(
      PROMPT_ERROR_CODES.PROMPT_FRONTMATTER_INVALID,
      `Prompt frontmatter is not valid YAML: ${filePath} (${(err as Error).message})`,
      { filePath },
    );
  }

  if (!frontmatter || typeof frontmatter !== 'object' || Array.isArray(frontmatter)) {
    throw new PromptRegistryError(
      PROMPT_ERROR_CODES.PROMPT_FRONTMATTER_INVALID,
      `Prompt frontmatter must be a YAML object: ${filePath}`,
      { filePath },
    );
  }

  return { frontmatter: frontmatter as Record<string, unknown>, body };
}
