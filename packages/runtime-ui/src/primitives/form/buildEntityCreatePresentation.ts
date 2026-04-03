import type {
  FormFieldPresentation,
  FormFieldRelationPresentation,
  IkaryFormPresentation,
} from '@ikary-manifest/presentation';
import type { BelongsToRelation, EntityDefinition, FieldDefinition } from '@ikary-manifest/contract';

/**
 * Derives which fields from an entity definition are visible on create forms,
 * sorted by effective create order. Mirrors the logic of deriveCreateFields
 * in @ikary-manifest/engine without adding that dependency.
 */
function getCreateFields(fields: readonly FieldDefinition[]): FieldDefinition[] {
  return (fields as FieldDefinition[])
    .filter((field) => {
      if ((field as Record<string, unknown>).system) return false;
      if (field.create?.visible === false) return false;
      if (field.create?.visible === undefined && field.form?.visible === false) return false;
      return true;
    })
    .slice()
    .sort((a, b) => (a.create?.order ?? 0) - (b.create?.order ?? 0));
}

function fieldToFormPresentation(field: FieldDefinition): FormFieldPresentation | null {
  if (field.type === 'boolean') {
    return {
      type: 'form-field',
      key: field.key,
      variant: 'checkbox',
      label: field.name ?? field.key,
      required: field.validation?.fieldRules?.some((r: Record<string, unknown>) => r['type'] === 'required') ?? false,
    } satisfies FormFieldPresentation;
  }

  const control = (() => {
    switch (field.type) {
      case 'number':
        return 'number' as const;
      case 'text':
        return 'textarea' as const;
      case 'date':
      case 'datetime':
        return 'date' as const;
      case 'enum':
        return 'select' as const;
      default:
        return 'text' as const;
    }
  })();

  const required =
    field.validation?.fieldRules?.some((r: Record<string, unknown>) => r['type'] === 'required') ?? false;

  const base: FormFieldPresentation = {
    type: 'form-field',
    key: field.key,
    variant: 'standard',
    control,
    label: field.name ?? field.key,
    required,
    ...((field.create?.placeholder ?? field.form?.placeholder)
      ? { placeholder: field.create?.placeholder ?? field.form?.placeholder }
      : {}),
    ...(control === 'select' && field.enumValues && field.enumValues.length > 0
      ? {
          options: (field.enumValues as string[]).map((v) => ({
            key: v,
            label: v,
            value: v,
          })),
        }
      : {}),
  };

  return base;
}

/**
 * Builds a static IkaryFormPresentation for creating a new entity.
 *
 * - Derives create-visible fields from the entity definition
 * - Replaces FK fields for belongs_to relations with createPolicy with
 *   FormFieldRelationPresentation entries
 * - Returns a commit-only form (no autosave)
 */
export function buildEntityCreatePresentation(entity: EntityDefinition): IkaryFormPresentation {
  const createFields = getCreateFields(entity.fields as FieldDefinition[]);

  // Collect relations with createPolicy
  const relationsWithPolicy = ((entity.relations ?? []) as BelongsToRelation[]).filter(
    (r): r is BelongsToRelation & { createPolicy: NonNullable<BelongsToRelation['createPolicy']> } =>
      r.relation === 'belongs_to' && r.createPolicy != null,
  );

  // Build a map from FK key → relation so we can replace the plain FK field
  const fkToRelation = new Map(relationsWithPolicy.map((r) => [r.foreignKey ?? `${r.key}Id`, r]));

  // Build a map from FK key → sort order (position in createFields)
  const fkOrder = new Map(createFields.map((f, i) => [f.key, i] as [string, number]));

  const fields: FormFieldPresentation[] = [];

  for (const field of createFields) {
    if (fkToRelation.has(field.key)) {
      // Replaced by relation field below; skip
      continue;
    }
    const p = fieldToFormPresentation(field);
    if (p) fields.push(p);
  }

  // Insert relation fields at their FK positions (sorted by original order)
  const sortedRelations = [...relationsWithPolicy].sort((a, b) => {
    const aKey = a.foreignKey ?? `${a.key}Id`;
    const bKey = b.foreignKey ?? `${b.key}Id`;
    return (fkOrder.get(aKey) ?? Infinity) - (fkOrder.get(bKey) ?? Infinity);
  });

  for (const relation of sortedRelations) {
    const fkKey = relation.foreignKey ?? `${relation.key}Id`;
    const order = fkOrder.get(fkKey) ?? fields.length;
    const fkFieldName = createFields.find((f) => f.key === fkKey)?.name;
    const relField: FormFieldRelationPresentation = {
      type: 'form-field',
      key: fkKey,
      variant: 'relation',
      label: relation.label ?? fkFieldName ?? relation.key,
      createPolicy: relation.createPolicy,
      targetEntity: relation.entity,
      ...(relation.displayField ? { displayField: relation.displayField } : {}),
    };
    fields.splice(order, 0, relField as FormFieldPresentation);
  }

  const safeFields = fields.length > 0 ? fields : ([] as FormFieldPresentation[]);

  return {
    type: 'form',
    key: `${entity.key}-create`,
    title: entity.name,
    mode: 'commit-only',
    sections: [
      {
        type: 'form-section',
        key: 'details',
        title: entity.name,
        layout: 'stack',
        fields:
          safeFields.length > 0
            ? safeFields
            : [
                {
                  type: 'form-field',
                  key: '_placeholder',
                  variant: 'standard',
                  control: 'text',
                  label: 'Name',
                },
              ],
      },
    ],
  };
}
