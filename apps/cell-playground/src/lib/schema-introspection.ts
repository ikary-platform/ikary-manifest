import type { ContractField } from '@ikary/cell-primitive-studio/ui';
import type { ZodTypeAny } from 'zod';

/** Unwrap any number of ZodEffects wrappers (.superRefine / .refine) */
function unwrapEffects(schema: ZodTypeAny): ZodTypeAny {
  let s = schema;
  while ((s._def as { typeName?: string }).typeName === 'ZodEffects') {
    s = (s._def as { schema: ZodTypeAny }).schema;
  }
  return s;
}

/**
 * Extracts top-level field documentation from a Zod object schema.
 * Unwraps ZodEffects (superRefine), skips the `type` discriminator field.
 *
 * Pass a nameRegistry to get richer type labels (e.g. `CellMetadataSchema`
 * instead of `object`) and to populate the `subSchema` / `subSchemaName`
 * fields used for drill-down navigation in ContractSchemaPanel.
 */
export function extractContractFields(
  schema: ZodTypeAny,
  nameRegistry?: Map<ZodTypeAny, string>,
): ContractField[] {
  const inner = unwrapEffects(schema);
  if ((inner._def as { typeName?: string }).typeName !== 'ZodObject') return [];

  const shape = (inner as unknown as { shape: Record<string, ZodTypeAny> }).shape;

  return Object.entries(shape)
    .filter(([name]) => name !== 'type')
    .map(([name, fieldSchema]) => {
      const isOptional = (fieldSchema._def as { typeName?: string }).typeName === 'ZodOptional';
      const innerType = isOptional
        ? (fieldSchema._def as { innerType: ZodTypeAny }).innerType
        : fieldSchema;

      // Resolve core type (stripping effects + optional wrappers)
      const coreType = unwrapEffects(innerType);
      const coreTypeName = (coreType._def as { typeName?: string }).typeName;

      let subSchema: unknown | undefined;
      let subSchemaName: string | undefined;

      if (coreTypeName === 'ZodObject') {
        subSchema = coreType;
        subSchemaName = nameRegistry?.get(coreType);
        // Also check before-unwrap reference (e.g. if the registry holds ZodEffects wrapper)
        if (!subSchemaName && nameRegistry) subSchemaName = nameRegistry.get(innerType);
      } else if (coreTypeName === 'ZodArray') {
        // Resolve the array item schema
        const rawItem = (coreType._def as { type: ZodTypeAny }).type;
        const itemCore = unwrapEffects(rawItem);
        if ((itemCore._def as { typeName?: string }).typeName === 'ZodObject') {
          subSchema = itemCore;
          subSchemaName = nameRegistry?.get(itemCore) ?? nameRegistry?.get(rawItem);
        }
      }

      return {
        name,
        type: zodTypeLabel(innerType, nameRegistry),
        required: !isOptional,
        description: fieldSchema.description ?? innerType.description,
        subSchema,
        subSchemaName,
      };
    });
}

function zodTypeLabel(schema: ZodTypeAny, nameRegistry?: Map<ZodTypeAny, string>): string {
  const core = unwrapEffects(schema);
  const def = core._def as Record<string, unknown>;

  // Check registry first for named schemas
  if (nameRegistry) {
    const regName = nameRegistry.get(core) ?? nameRegistry.get(schema);
    if (regName) return regName;
  }

  switch (def.typeName) {
    case 'ZodString':   return 'string';
    case 'ZodBoolean':  return 'boolean';
    case 'ZodNumber':   return 'number';
    case 'ZodLiteral':  return JSON.stringify(def.value);
    case 'ZodEnum':     return (def.values as string[]).map((v) => JSON.stringify(v)).join(' | ');
    case 'ZodArray': {
      const itemLabel = zodTypeLabel((def.type as ZodTypeAny), nameRegistry);
      return `${itemLabel}[]`;
    }
    case 'ZodObject':   return 'object';
    case 'ZodUnion':    return (def.options as ZodTypeAny[]).map((o) => zodTypeLabel(o, nameRegistry)).join(' | ');
    case 'ZodOptional': return zodTypeLabel(def.innerType as ZodTypeAny, nameRegistry);
    case 'ZodNullable': return `${zodTypeLabel(def.innerType as ZodTypeAny, nameRegistry)} | null`;
    default:
      return ((def.typeName as string | undefined) ?? 'unknown')
        .replace('Zod', '')
        .toLowerCase();
  }
}
