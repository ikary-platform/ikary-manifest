import type { CellManifestV1, EntityDefinition, FieldDefinition, ValidationError } from '../shared/types';
import { BASE_ENTITY_FIELD_KEYS } from '../shared/base-entity';

function checkBaseFieldConflicts(fields: FieldDefinition[], entityKey: string, prefix: string): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const field of fields) {
    if (BASE_ENTITY_FIELD_KEYS.has(field.key)) {
      errors.push({
        field: `spec.entities[${entityKey}].fields[${prefix}${field.key}]`,
        message: `Field key "${field.key}" is reserved by the base entity and is automatically injected. Remove it from the manifest.`,
      });
    }

    if (field.type === 'object' && field.fields) {
      errors.push(...checkBaseFieldConflicts(field.fields, entityKey, `${prefix}${field.key}.`));
    }
  }

  return errors;
}

function validateFields(
  fields: FieldDefinition[],
  entityKey: string,
  depth: number,
  pathPrefix: string,
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const field of fields) {
    const fieldPath = `spec.entities[${entityKey}].fields[${pathPrefix}${field.key}]`;

    if (field.type === 'enum' && (!field.enumValues || field.enumValues.length === 0)) {
      errors.push({ field: fieldPath, message: 'Enum field must have non-empty enumValues' });
    }

    if (field.type !== 'object') {
      continue;
    }

    if (depth >= 3) {
      errors.push({
        field: fieldPath,
        message: `Object field "${field.key}" exceeds max nesting depth of 3`,
      });
      continue;
    }

    errors.push(...validateFields(field.fields ?? [], entityKey, depth + 1, `${pathPrefix}${field.key}.`));
  }

  return errors;
}

function validateRelations(entity: EntityDefinition, fieldKeys: Set<string>): ValidationError[] {
  const errors: ValidationError[] = [];
  const relations = entity.relations ?? [];
  const relationKeys = new Set<string>();

  for (const relation of relations) {
    const path = `spec.entities[${entity.key}].relations[${relation.key}]`;

    if (relationKeys.has(relation.key)) {
      errors.push({ field: path, message: `Duplicate relation key: "${relation.key}"` });
    }
    relationKeys.add(relation.key);

    if (fieldKeys.has(relation.key)) {
      errors.push({
        field: path,
        message: `Relation key "${relation.key}" conflicts with a field key of the same name`,
      });
    }

    if (BASE_ENTITY_FIELD_KEYS.has(relation.key)) {
      errors.push({
        field: path,
        message: `Relation key "${relation.key}" conflicts with a reserved base entity field key`,
      });
    }

    if (relation.relation === 'belongs_to' && !relation.key.endsWith('_id')) {
      errors.push({ field: path, message: 'belongs_to relation key must end with "_id"' });
    }

    if (relation.relation === 'self' && !relation.key.endsWith('_id')) {
      errors.push({ field: path, message: 'self relation key must end with "_id"' });
    }
  }

  return errors;
}

function validateComputedFields(
  entity: EntityDefinition,
  fieldKeys: Set<string>,
  relationKeys: Set<string>,
): ValidationError[] {
  const errors: ValidationError[] = [];
  const computedFields = entity.computed ?? [];
  const computedKeys = new Set<string>();

  for (const computedField of computedFields) {
    const path = `spec.entities[${entity.key}].computed[${computedField.key}]`;

    if (computedKeys.has(computedField.key)) {
      errors.push({ field: path, message: `Duplicate computed field key: "${computedField.key}"` });
    }
    computedKeys.add(computedField.key);

    if (fieldKeys.has(computedField.key)) {
      errors.push({
        field: path,
        message: `Computed field key "${computedField.key}" conflicts with a field key of the same name`,
      });
    }

    if (relationKeys.has(computedField.key)) {
      errors.push({
        field: path,
        message: `Computed field key "${computedField.key}" conflicts with a relation key of the same name`,
      });
    }

    if (BASE_ENTITY_FIELD_KEYS.has(computedField.key)) {
      errors.push({
        field: path,
        message: `Computed field key "${computedField.key}" conflicts with a reserved base entity field key`,
      });
    }

    if (computedField.formulaType === 'aggregation' && computedField.operation !== 'count' && !computedField.field) {
      errors.push({
        field: path,
        message: `Aggregation operation "${computedField.operation}" requires a "field" property`,
      });
    }
  }

  return errors;
}

function validateLifecycle(entity: EntityDefinition, fieldKeys: Set<string>): ValidationError[] {
  const lifecycle = entity.lifecycle;
  if (!lifecycle) {
    return [];
  }

  const errors: ValidationError[] = [];
  const base = `spec.entities[${entity.key}].lifecycle`;
  const stateSet = new Set(lifecycle.states);

  if (!fieldKeys.has(lifecycle.field)) {
    errors.push({
      field: `${base}.field`,
      message: `lifecycle.field "${lifecycle.field}" does not reference a declared field key`,
    });
  }

  if (!stateSet.has(lifecycle.initial)) {
    errors.push({
      field: `${base}.initial`,
      message: `lifecycle.initial "${lifecycle.initial}" is not listed in lifecycle.states`,
    });
  }

  const duplicateStates = lifecycle.states.filter((state, index) => lifecycle.states.indexOf(state) !== index);
  for (const state of new Set(duplicateStates)) {
    errors.push({ field: `${base}.states`, message: `Duplicate lifecycle state: "${state}"` });
  }

  const transitionKeys = new Set<string>();
  for (const transition of lifecycle.transitions) {
    const transitionPath = `${base}.transitions[${transition.key}]`;

    if (transitionKeys.has(transition.key)) {
      errors.push({ field: transitionPath, message: `Duplicate transition key: "${transition.key}"` });
    }
    transitionKeys.add(transition.key);

    if (!stateSet.has(transition.from)) {
      errors.push({
        field: transitionPath,
        message: `Transition "${transition.key}" from-state "${transition.from}" is not in lifecycle.states`,
      });
    }

    if (!stateSet.has(transition.to)) {
      errors.push({
        field: transitionPath,
        message: `Transition "${transition.key}" to-state "${transition.to}" is not in lifecycle.states`,
      });
    }
  }

  return errors;
}

function validateCapabilities(entity: EntityDefinition, fieldKeys: Set<string>): ValidationError[] {
  const capabilities = entity.capabilities;
  if (!capabilities || capabilities.length === 0) {
    return [];
  }

  const errors: ValidationError[] = [];
  const base = `spec.entities[${entity.key}].capabilities`;
  const capabilityKeys = new Set<string>();
  const transitionKeys = new Set((entity.lifecycle?.transitions ?? []).map((transition) => transition.key));

  for (const capability of capabilities) {
    const path = `${base}[${capability.key}]`;

    if (capabilityKeys.has(capability.key)) {
      errors.push({ field: path, message: `Duplicate capability key: "${capability.key}"` });
    }
    capabilityKeys.add(capability.key);

    if (fieldKeys.has(capability.key)) {
      errors.push({ field: path, message: `Capability key "${capability.key}" conflicts with a field key` });
    }

    if (BASE_ENTITY_FIELD_KEYS.has(capability.key)) {
      errors.push({
        field: path,
        message: `Capability key "${capability.key}" conflicts with a reserved base entity field key`,
      });
    }

    if (capability.type === 'transition') {
      if (!entity.lifecycle) {
        errors.push({
          field: path,
          message: `Capability "${capability.key}" references transition "${capability.transition}" but entity has no lifecycle defined`,
        });
      } else if (!transitionKeys.has(capability.transition)) {
        errors.push({
          field: path,
          message: `Capability "${capability.key}" references unknown lifecycle transition "${capability.transition}"`,
        });
      }
    }

    const inputKeys = new Set<string>();
    for (const input of capability.inputs ?? []) {
      const inputPath = `${path}.inputs[${input.key}]`;

      if (inputKeys.has(input.key)) {
        errors.push({ field: inputPath, message: `Duplicate input key: "${input.key}"` });
      }
      inputKeys.add(input.key);

      if (input.type === 'select' && (!input.options || input.options.length === 0)) {
        errors.push({
          field: inputPath,
          message: `Input "${input.key}" of type "select" must have a non-empty options array`,
        });
      }

      if (input.type === 'entity' && !input.entity) {
        errors.push({
          field: inputPath,
          message: `Input "${input.key}" of type "entity" must specify an "entity" key`,
        });
      }
    }
  }

  return errors;
}

function validateEvents(entity: EntityDefinition, fieldKeys: Set<string>): ValidationError[] {
  const events = entity.events;
  if (!events) {
    return [];
  }

  const errors: ValidationError[] = [];
  const base = `spec.entities[${entity.key}].events`;

  for (const key of events.exclude ?? []) {
    if (!fieldKeys.has(key)) {
      errors.push({
        field: `${base}.exclude`,
        message: `events.exclude field "${key}" does not reference a declared field key`,
      });
    }
  }

  return errors;
}

function validatePolicies(entity: EntityDefinition, fieldKeys: Set<string>): ValidationError[] {
  const errors: ValidationError[] = [];
  const base = `spec.entities[${entity.key}]`;

  if (!entity.fieldPolicies) {
    return errors;
  }

  for (const fieldKey of Object.keys(entity.fieldPolicies)) {
    if (!fieldKeys.has(fieldKey)) {
      errors.push({
        field: `${base}.fieldPolicies`,
        message: `fieldPolicies key "${fieldKey}" does not reference a declared field key`,
      });
    }

    if (BASE_ENTITY_FIELD_KEYS.has(fieldKey)) {
      errors.push({
        field: `${base}.fieldPolicies`,
        message: `fieldPolicies key "${fieldKey}" conflicts with a reserved base entity field key`,
      });
    }
  }

  return errors;
}

/**
 * Validates a single EntityDefinition against all semantic/business rules
 * without requiring a full CellManifestV1 wrapper.
 * Used by AI generation services to catch cross-field errors before proposing a schema.
 */
export function validateSingleEntitySemantics(entity: EntityDefinition): ValidationError[] {
  const fieldKeys = new Set(entity.fields.map((f) => f.key));
  const relationKeys = new Set((entity.relations ?? []).map((r) => r.key));
  return [
    ...validateFields(entity.fields, entity.key, 1, ''),
    ...checkBaseFieldConflicts(entity.fields, entity.key, ''),
    ...validateRelations(entity, fieldKeys),
    ...validateComputedFields(entity, fieldKeys, relationKeys),
    ...validateLifecycle(entity, fieldKeys),
    ...validateEvents(entity, fieldKeys),
    ...validateCapabilities(entity, fieldKeys),
    ...validatePolicies(entity, fieldKeys),
  ];
}

export function validateEntityRules(manifest: CellManifestV1): ValidationError[] {
  const errors: ValidationError[] = [];
  const entities = manifest.spec.entities ?? [];

  for (const entity of entities) {
    errors.push(...validateFields(entity.fields, entity.key, 1, ''));
  }

  for (const entity of entities) {
    errors.push(...checkBaseFieldConflicts(entity.fields, entity.key, ''));
  }

  for (const entity of entities) {
    const fieldKeys = new Set(entity.fields.map((field) => field.key));
    errors.push(...validateRelations(entity, fieldKeys));
  }

  for (const entity of entities) {
    const fieldKeys = new Set(entity.fields.map((field) => field.key));
    const relationKeys = new Set((entity.relations ?? []).map((relation) => relation.key));
    errors.push(...validateComputedFields(entity, fieldKeys, relationKeys));
  }

  for (const entity of entities) {
    const fieldKeys = new Set(entity.fields.map((field) => field.key));
    errors.push(...validateLifecycle(entity, fieldKeys));
  }

  for (const entity of entities) {
    const fieldKeys = new Set(entity.fields.map((field) => field.key));
    errors.push(...validateEvents(entity, fieldKeys));
  }

  for (const entity of entities) {
    const fieldKeys = new Set(entity.fields.map((field) => field.key));
    errors.push(...validateCapabilities(entity, fieldKeys));
  }

  for (const entity of entities) {
    const fieldKeys = new Set(entity.fields.map((field) => field.key));
    errors.push(...validatePolicies(entity, fieldKeys));
  }

  return errors;
}
