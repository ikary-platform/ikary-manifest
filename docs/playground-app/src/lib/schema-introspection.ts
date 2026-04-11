import type { ContractField } from '@ikary/primitive-studio/ui';
import type { ZodTypeAny } from 'zod';

/**
 * Extracts top-level field documentation from a Zod object schema.
 * Unwraps ZodEffects (superRefine), skips the `type` discriminator field.
 */
export function extractContractFields(schema: ZodTypeAny): ContractField[] {
  let inner: ZodTypeAny = schema;
  // Unwrap ZodEffects layers (added by .superRefine / .refine)
  while ((inner._def as { typeName?: string }).typeName === 'ZodEffects') {
    inner = (inner._def as { schema: ZodTypeAny }).schema;
  }

  if ((inner._def as { typeName?: string }).typeName !== 'ZodObject') return [];

  const shape = (inner as unknown as { shape: Record<string, ZodTypeAny> }).shape;

  return Object.entries(shape)
    .filter(([name]) => name !== 'type')
    .map(([name, fieldSchema]) => {
      const isOptional = (fieldSchema._def as { typeName?: string }).typeName === 'ZodOptional';
      const innerType = isOptional
        ? (fieldSchema._def as { innerType: ZodTypeAny }).innerType
        : fieldSchema;
      return {
        name,
        type: zodTypeLabel(innerType),
        required: !isOptional,
        description: fieldSchema.description ?? innerType.description,
      };
    });
}

function zodTypeLabel(schema: ZodTypeAny): string {
  const def = schema._def as Record<string, unknown>;
  switch (def.typeName) {
    case 'ZodString':
      return 'string';
    case 'ZodBoolean':
      return 'boolean';
    case 'ZodNumber':
      return 'number';
    case 'ZodLiteral':
      return JSON.stringify(def.value);
    case 'ZodEnum':
      return (def.values as string[]).map((v) => JSON.stringify(v)).join(' | ');
    case 'ZodArray':
      return `${zodTypeLabel(def.type as ZodTypeAny)}[]`;
    case 'ZodObject':
      return 'object';
    case 'ZodUnion':
      return (def.options as ZodTypeAny[]).map(zodTypeLabel).join(' | ');
    case 'ZodOptional':
      return zodTypeLabel(def.innerType as ZodTypeAny);
    case 'ZodNullable':
      return `${zodTypeLabel(def.innerType as ZodTypeAny)} | null`;
    case 'ZodEffects':
      return zodTypeLabel(def.schema as ZodTypeAny);
    default:
      return ((def.typeName as string | undefined) ?? 'unknown')
        .replace('Zod', '')
        .toLowerCase();
  }
}
