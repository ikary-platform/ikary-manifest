import type { PromptSanitizer, InputSizeGuard } from '@ikary/system-ai/server';
import type { RegistryArgHook } from '../shared/registry-core';
import { DEFAULT_USER_ARG_MAX_BYTES } from '../shared/prompt-metadata.schema';

export function createSanitizationHook(
  sanitizer: PromptSanitizer,
  sizeGuard: InputSizeGuard,
): RegistryArgHook {
  return (value, arg, ctx) => {
    if (arg.source !== 'user') return value;
    if (arg.type !== 'string' || typeof value !== 'string') return value;
    const limit = arg.maxBytes ?? DEFAULT_USER_ARG_MAX_BYTES;
    const correlationId = ctx.correlationId ?? '';
    sizeGuard.enforce(value, limit, correlationId);
    return sanitizer.sanitize(value, {
      correlationId,
      taskName: ctx.taskName ?? arg.name,
    });
  };
}
