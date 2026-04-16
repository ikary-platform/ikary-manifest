import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ZodError } from 'zod';
import { ikaryConfigSchema, type IkaryConfig } from './ikary-config.schema.js';

export const IKARY_CONFIG_FILENAME = 'ikary.config.json';

/**
 * Thrown when `ikary.config.json` exists but cannot be parsed as valid JSON,
 * or fails the Zod schema. Caught at the command layer so the CLI can show a
 * friendly error instead of a stack trace.
 */
export class IkaryConfigError extends Error {
  constructor(message: string, readonly configPath: string) {
    super(message);
    this.name = 'IkaryConfigError';
  }
}

/**
 * Read and validate `ikary.config.json` from the given directory (defaults to
 * the current working directory). Missing file is not an error — returns the
 * schema's default empty shape so callers never need to null-check.
 */
export function loadIkaryConfig(cwd: string = process.cwd()): IkaryConfig {
  const configPath = resolve(cwd, IKARY_CONFIG_FILENAME);
  if (!existsSync(configPath)) {
    return ikaryConfigSchema.parse({});
  }

  const raw = readFileSync(configPath, 'utf-8');

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new IkaryConfigError(
      `Failed to parse ${IKARY_CONFIG_FILENAME}: ${reason}`,
      configPath,
    );
  }

  try {
    return ikaryConfigSchema.parse(parsed);
  } catch (err) {
    if (err instanceof ZodError) {
      const issues = err.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
      throw new IkaryConfigError(
        `${IKARY_CONFIG_FILENAME} is invalid:\n${issues}`,
        configPath,
      );
    }
    throw err;
  }
}
