import { compileCellApp, isValidationResult } from '@ikary/cell-engine';
import type { CellManifestV1 } from '@ikary/cell-contract-core';
import type {
  DiscoveryArtifact,
  InitialGenerationArtifactSet,
  PatchOperation,
  PlanArtifact,
  StudioCurrentArtifactSet,
  StudioPhase,
} from './contracts';
import { parsePhaseOutput, discoveryArtifactSchema, planArtifactSchema, patchOperationSchema } from './phase-schemas';

export interface ValidationOutcome<T = unknown> {
  ok: boolean;
  parsed?: T;
  errors: string[];
}

export function validatePhaseOutput(phase: StudioPhase, payload: unknown): ValidationOutcome {
  try {
    const parsed = parsePhaseOutput(phase, payload);
    return {
      ok: true,
      parsed,
      errors: [],
    };
  } catch (error) {
    return {
      ok: false,
      errors: [error instanceof Error ? error.message : 'Invalid phase output payload.'],
    };
  }
}

export function validateDiscoveryCompletion(discovery: DiscoveryArtifact): ValidationOutcome<DiscoveryArtifact> {
  const parsed = discoveryArtifactSchema.safeParse(discovery);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((issue) => issue.message),
    };
  }

  const errors: string[] = [];
  if (!parsed.data.cell_name.trim()) {
    errors.push('discovery.cell_name is required');
  }
  if (!parsed.data.domain.trim()) {
    errors.push('discovery.domain is required');
  }
  if (parsed.data.key_entities.length < 1) {
    errors.push('discovery.key_entities requires at least one entity');
  }

  return {
    ok: errors.length === 0,
    parsed: parsed.data,
    errors,
  };
}

export function validatePlan(plan: PlanArtifact): ValidationOutcome<PlanArtifact> {
  const parsed = planArtifactSchema.safeParse(plan);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((issue) => issue.message),
    };
  }

  return {
    ok: true,
    parsed: parsed.data,
    errors: [],
  };
}

function collectManifestCompileErrors(manifest: unknown): string[] {
  const compileResult = compileCellApp(manifest as CellManifestV1);
  if (isValidationResult(compileResult)) {
    return compileResult.errors.map((error) => `${error.field}: ${error.message}`);
  }
  return [];
}

function validateReferenceLinks(set: InitialGenerationArtifactSet): string[] {
  const errors: string[] = [];

  const entityKeys = new Set(set.entity_schemas.map((entity) => entity.key));
  const pageKeys = new Set((set.cell_manifest.spec.pages ?? []).map((page) => page.key));

  for (const layout of set.layouts) {
    if (layout.entity && !entityKeys.has(layout.entity)) {
      errors.push(`layout.${layout.key} references unknown entity '${layout.entity}'`);
    }
  }

  for (const action of set.actions) {
    if (action.target_entity && !entityKeys.has(action.target_entity)) {
      errors.push(`action.${action.key} references unknown target_entity '${action.target_entity}'`);
    }

    if (action.target_page && !pageKeys.has(action.target_page)) {
      errors.push(`action.${action.key} references unknown target_page '${action.target_page}'`);
    }
  }

  for (const permission of set.permissions) {
    if (!entityKeys.has(permission.entity_key)) {
      errors.push(`permission.${permission.key} references unknown entity_key '${permission.entity_key}'`);
    }

    if (!permission.scope.startsWith(`${permission.entity_key}.`)) {
      errors.push(`permission.${permission.key} scope should start with '${permission.entity_key}.'`);
    }
  }

  return errors;
}

function validateManifestAlignment(set: InitialGenerationArtifactSet): string[] {
  const errors: string[] = [];

  const manifestEntityKeys = new Set((set.cell_manifest.spec.entities ?? []).map((entity) => entity.key));

  for (const entity of set.entity_schemas) {
    if (!manifestEntityKeys.has(entity.key)) {
      errors.push(`cell_manifest.spec.entities is missing entity '${entity.key}'`);
    }
  }

  const manifestPageKeys = new Set((set.cell_manifest.spec.pages ?? []).map((page) => page.key));
  for (const layout of set.layouts) {
    if (!manifestPageKeys.has(layout.key)) {
      errors.push(`cell_manifest.spec.pages is missing layout/page '${layout.key}'`);
    }
  }

  return errors;
}

export function validateInitialGeneration(
  set: InitialGenerationArtifactSet,
): ValidationOutcome<InitialGenerationArtifactSet> {
  const errors: string[] = [];

  errors.push(...collectManifestCompileErrors(set.cell_manifest));
  errors.push(...validateReferenceLinks(set));
  errors.push(...validateManifestAlignment(set));

  return {
    ok: errors.length === 0,
    parsed: set,
    errors,
  };
}

export function validatePatchOperations(operations: PatchOperation[]): ValidationOutcome<PatchOperation[]> {
  const errors: string[] = [];

  for (const [index, operation] of operations.entries()) {
    const parsed = patchOperationSchema.safeParse(operation);
    if (!parsed.success) {
      errors.push(`patch[${index}] invalid: ${parsed.error.issues.map((issue) => issue.message).join(', ')}`);
      continue;
    }

    const path = parsed.data.path;
    const isKnownRoot =
      path.startsWith('/manifest') ||
      path.startsWith('/entity_schema') ||
      path.startsWith('/layout') ||
      path.startsWith('/action') ||
      path.startsWith('/permission');

    if (!isKnownRoot) {
      errors.push(
        `patch[${index}] path '${path}' must start with /manifest, /entity_schema, /layout, /action, or /permission`,
      );
    }

    if (parsed.data.op === 'move' && !parsed.data.from) {
      errors.push(`patch[${index}] move operation requires 'from'`);
    }

    if ((parsed.data.op === 'add' || parsed.data.op === 'replace') && parsed.data.value === undefined) {
      errors.push(`patch[${index}] ${parsed.data.op} operation requires 'value'`);
    }
  }

  return {
    ok: errors.length === 0,
    parsed: operations,
    errors,
  };
}

export function validateCurrentArtifactsForPreview(current: StudioCurrentArtifactSet): ValidationOutcome {
  if (!current.manifest) {
    return {
      ok: false,
      errors: ['No current manifest artifact found.'],
    };
  }

  const compileErrors = collectManifestCompileErrors(current.manifest);

  return {
    ok: compileErrors.length === 0,
    parsed: current.manifest,
    errors: compileErrors,
  };
}
