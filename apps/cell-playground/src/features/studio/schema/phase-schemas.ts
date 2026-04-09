import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { CellManifestV1Schema } from '@ikary/cell-contract-core';
import type { StudioPhase } from '../contracts';

const simpleStringArray = z.array(z.string().min(1)).default([]);

const fieldDefinitionSchema: z.ZodType = z.lazy(() =>
  z.object({
    key: z.string().min(1),
    type: z.enum(['string', 'text', 'number', 'boolean', 'date', 'datetime', 'enum', 'object']),
    name: z.string().min(1),
    enumValues: z.array(z.string().min(1)).optional(),
    system: z.boolean().optional(),
    helpText: z.string().optional(),
    smallTip: z.string().optional(),
    readonly: z.boolean().optional(),
    list: z
      .object({
        visible: z.boolean().optional(),
        sortable: z.boolean().optional(),
        searchable: z.boolean().optional(),
        filterable: z.boolean().optional(),
      })
      .optional(),
    form: z
      .object({
        visible: z.boolean().optional(),
        placeholder: z.string().optional(),
      })
      .optional(),
    create: z
      .object({
        visible: z.boolean().optional(),
        order: z.number().int().optional(),
        placeholder: z.string().optional(),
      })
      .optional(),
    edit: z
      .object({
        visible: z.boolean().optional(),
        order: z.number().int().optional(),
        placeholder: z.string().optional(),
      })
      .optional(),
    fields: z.array(fieldDefinitionSchema).optional(),
  }),
);

export const discoveryArtifactSchema = z.object({
  cell_name: z.string().min(1),
  domain: z.string().min(1),
  summary: z.string().min(1),
  key_entities: z.array(z.string().min(1)).min(1),
  assumptions: simpleStringArray,
  unknowns: simpleStringArray,
});

export const planArtifactSchema = z.object({
  proposed_cell_name: z.string().min(1),
  proposed_domain: z.string().min(1),
  entities_to_generate: z.array(z.string().min(1)).min(1),
  pages_to_generate: z.array(z.string().min(1)).min(1),
  actions_to_generate: simpleStringArray,
  permissions_to_generate: simpleStringArray,
  explanation_summary: z.string().min(1),
  generation_ready: z.boolean(),
});

export const studioLayoutSchema = z.object({
  key: z.string().min(1),
  type: z.enum(['entity-list', 'entity-detail', 'entity-create', 'entity-edit', 'dashboard', 'custom']),
  title: z.string().min(1),
  path: z.string().min(1),
  entity: z.string().min(1).optional(),
  blocks: z.array(z.unknown()).optional(),
});

export const studioActionSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  intent: z.enum(['create', 'update', 'delete', 'submit', 'confirm', 'cancel', 'open', 'close', 'toggle', 'custom']),
  target_entity: z.string().optional(),
  target_page: z.string().optional(),
  required_permission: z.string().optional(),
  description: z.string().optional(),
});

export const studioPermissionSchema = z.object({
  key: z.string().min(1),
  entity_key: z.string().min(1),
  action: z.enum(['read', 'create', 'update', 'delete', 'admin']),
  scope: z.string().min(1),
  description: z.string().optional(),
});

export const patchOperationSchema = z.object({
  op: z.enum(['add', 'remove', 'replace', 'move']),
  path: z.string().min(1),
  from: z.string().optional(),
  value: z.unknown().optional(),
});

export const patchArtifactSchema = z.object({
  patch_operations: z.array(patchOperationSchema).min(1),
});

export const replacementArtifactsSchema = z.object({
  cell_manifest: CellManifestV1Schema.optional(),
  entity_schemas: z
    .array(
      z.object({
        key: z.string().min(1),
        name: z.string().min(1),
        pluralName: z.string().min(1),
        fields: z.array(fieldDefinitionSchema),
        relations: z.array(z.unknown()).optional(),
        computed: z.array(z.unknown()).optional(),
        lifecycle: z.unknown().optional(),
        events: z.unknown().optional(),
        capabilities: z.array(z.unknown()).optional(),
        policies: z.unknown().optional(),
        fieldPolicies: z.unknown().optional(),
      }),
    )
    .optional(),
  layouts: z.array(studioLayoutSchema).optional(),
  actions: z.array(studioActionSchema).optional(),
  permissions: z.array(studioPermissionSchema).optional(),
});

export const phase1OutputSchema = z.object({
  assistant_visible_text: z.string().min(1),
  discovery: discoveryArtifactSchema,
});

export const phase2OutputSchema = z.object({
  assistant_visible_text: z.string().min(1),
  plan: planArtifactSchema,
});

export const phase3OutputSchema = z.object({
  assistant_visible_text: z.string().min(1),
  initial_generation: z.object({
    cell_manifest: CellManifestV1Schema,
    entity_schemas: z
      .array(
        z.object({
          key: z.string().min(1),
          name: z.string().min(1),
          pluralName: z.string().min(1),
          fields: z.array(fieldDefinitionSchema),
          relations: z.array(z.unknown()).optional(),
          computed: z.array(z.unknown()).optional(),
          lifecycle: z.unknown().optional(),
          events: z.unknown().optional(),
          capabilities: z.array(z.unknown()).optional(),
          policies: z.unknown().optional(),
          fieldPolicies: z.unknown().optional(),
        }),
      )
      .min(1),
    layouts: z.array(studioLayoutSchema).min(1),
    actions: z.array(studioActionSchema).default([]),
    permissions: z.array(studioPermissionSchema).default([]),
  }),
});

export const phase4OutputSchema = z
  .object({
    assistant_visible_text: z.string().min(1),
    mode: z.enum(['patch', 'replacement']),
    patch: patchArtifactSchema.optional(),
    replacement_artifacts: replacementArtifactsSchema.optional(),
  })
  .superRefine((value, context) => {
    if (value.mode === 'patch' && !value.patch) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'patch is required when mode=patch' });
    }

    if (value.mode === 'replacement' && !value.replacement_artifacts) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'replacement_artifacts is required when mode=replacement',
      });
    }
  });

export const Phase1OutputSchema = phase1OutputSchema;
export const Phase2OutputSchema = phase2OutputSchema;
export const Phase3OutputSchema = phase3OutputSchema;
export const Phase4OutputSchema = phase4OutputSchema;

export function parsePhaseOutput(phase: StudioPhase, payload: unknown) {
  switch (phase) {
    case 'phase1_define':
      return phase1OutputSchema.parse(payload);
    case 'phase2_plan':
      return phase2OutputSchema.parse(payload);
    case 'phase3_generate':
      return phase3OutputSchema.parse(payload);
    case 'phase4_tweak':
      return phase4OutputSchema.parse(payload);
  }
}

const PHASE_ZOD_OUTPUT_SCHEMAS: Record<StudioPhase, z.ZodTypeAny> = {
  phase1_define: phase1OutputSchema,
  phase2_plan: phase2OutputSchema,
  phase3_generate: phase3OutputSchema,
  phase4_tweak: phase4OutputSchema,
};

export function responseZodJsonSchemaForPhase(phase: StudioPhase): Record<string, unknown> {
  return zodToJsonSchema(PHASE_ZOD_OUTPUT_SCHEMAS[phase], {
    name: `ikary_studio_${phase}_zod_output`,
    $refStrategy: 'root',
  }) as Record<string, unknown>;
}

const STRICT_FIELD_JSON_SCHEMA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  required: ['key', 'type', 'name'],
  properties: {
    key: { type: 'string' },
    type: { type: 'string', enum: ['string', 'text', 'number', 'boolean', 'date', 'datetime', 'enum', 'object'] },
    name: { type: 'string' },
  },
};

const STRICT_ENTITY_JSON_SCHEMA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  required: ['key', 'name', 'pluralName', 'fields'],
  properties: {
    key: { type: 'string' },
    name: { type: 'string' },
    pluralName: { type: 'string' },
    fields: { type: 'array', minItems: 1, items: STRICT_FIELD_JSON_SCHEMA },
  },
};

const STRICT_PAGE_JSON_SCHEMA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  required: ['key', 'type', 'title', 'path', 'entity'],
  properties: {
    key: { type: 'string' },
    type: { type: 'string', enum: ['entity-list', 'entity-detail', 'entity-create', 'entity-edit'] },
    title: { type: 'string' },
    path: { type: 'string' },
    entity: { type: 'string' },
  },
};

const STRICT_CELL_MANIFEST_JSON_SCHEMA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  required: ['apiVersion', 'kind', 'metadata', 'spec'],
  properties: {
    apiVersion: { type: 'string', enum: ['ikary.io/v1alpha1'] },
    kind: { type: 'string', enum: ['Cell'] },
    metadata: {
      type: 'object',
      additionalProperties: false,
      required: ['key', 'name', 'version'],
      properties: {
        key: { type: 'string' },
        name: { type: 'string' },
        version: { type: 'string' },
      },
    },
    spec: {
      type: 'object',
      additionalProperties: false,
      required: ['mount', 'entities', 'pages'],
      properties: {
        mount: {
          type: 'object',
          additionalProperties: false,
          required: ['mountPath', 'landingPage'],
          properties: {
            title: { type: 'string' },
            mountPath: { type: 'string' },
            landingPage: { type: 'string' },
          },
        },
        entities: { type: 'array', minItems: 1, items: STRICT_ENTITY_JSON_SCHEMA },
        pages: { type: 'array', minItems: 1, items: STRICT_PAGE_JSON_SCHEMA },
      },
    },
  },
};

const STRICT_STUDIO_LAYOUT_JSON_SCHEMA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  required: ['key', 'type', 'title', 'path', 'entity'],
  properties: {
    key: { type: 'string' },
    type: { type: 'string', enum: ['entity-list', 'entity-detail', 'entity-create', 'entity-edit'] },
    title: { type: 'string' },
    path: { type: 'string' },
    entity: { type: 'string' },
  },
};

const STRICT_STUDIO_ACTION_JSON_SCHEMA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  required: ['key', 'label', 'intent'],
  properties: {
    key: { type: 'string' },
    label: { type: 'string' },
    intent: {
      type: 'string',
      enum: ['create', 'update', 'delete', 'submit', 'confirm', 'cancel', 'open', 'close', 'toggle', 'custom'],
    },
  },
};

const STRICT_STUDIO_PERMISSION_JSON_SCHEMA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  required: ['key', 'entity_key', 'action', 'scope'],
  properties: {
    key: { type: 'string' },
    entity_key: { type: 'string' },
    action: { type: 'string', enum: ['read', 'create', 'update', 'delete', 'admin'] },
    scope: { type: 'string' },
  },
};

const STRICT_PATCH_OPERATION_JSON_SCHEMA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  required: ['op', 'path', 'from', 'value'],
  properties: {
    op: { type: 'string', enum: ['add', 'remove', 'replace', 'move'] },
    path: { type: 'string' },
    from: { type: 'string' },
    value: {},
  },
};

const PHASE_JSON_SCHEMAS: Record<StudioPhase, Record<string, unknown>> = {
  phase1_define: {
    type: 'object',
    additionalProperties: false,
    required: ['assistant_visible_text', 'discovery'],
    properties: {
      assistant_visible_text: { type: 'string' },
      discovery: {
        type: 'object',
        additionalProperties: false,
        required: ['cell_name', 'domain', 'summary', 'key_entities', 'assumptions', 'unknowns'],
        properties: {
          cell_name: { type: 'string' },
          domain: { type: 'string' },
          summary: { type: 'string' },
          key_entities: { type: 'array', items: { type: 'string' }, minItems: 1 },
          assumptions: { type: 'array', items: { type: 'string' } },
          unknowns: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
  phase2_plan: {
    type: 'object',
    additionalProperties: false,
    required: ['assistant_visible_text', 'plan'],
    properties: {
      assistant_visible_text: { type: 'string' },
      plan: {
        type: 'object',
        additionalProperties: false,
        required: [
          'proposed_cell_name',
          'proposed_domain',
          'entities_to_generate',
          'pages_to_generate',
          'actions_to_generate',
          'permissions_to_generate',
          'explanation_summary',
          'generation_ready',
        ],
        properties: {
          proposed_cell_name: { type: 'string' },
          proposed_domain: { type: 'string' },
          entities_to_generate: { type: 'array', items: { type: 'string' }, minItems: 1 },
          pages_to_generate: { type: 'array', items: { type: 'string' }, minItems: 1 },
          actions_to_generate: { type: 'array', items: { type: 'string' } },
          permissions_to_generate: { type: 'array', items: { type: 'string' } },
          explanation_summary: { type: 'string' },
          generation_ready: { type: 'boolean' },
        },
      },
    },
  },
  phase3_generate: {
    type: 'object',
    additionalProperties: false,
    required: ['assistant_visible_text', 'initial_generation'],
    properties: {
      assistant_visible_text: { type: 'string' },
      initial_generation: {
        type: 'object',
        additionalProperties: false,
        required: ['cell_manifest', 'entity_schemas', 'layouts', 'actions', 'permissions'],
        properties: {
          cell_manifest: STRICT_CELL_MANIFEST_JSON_SCHEMA,
          entity_schemas: { type: 'array', minItems: 1, items: STRICT_ENTITY_JSON_SCHEMA },
          layouts: { type: 'array', minItems: 1, items: STRICT_STUDIO_LAYOUT_JSON_SCHEMA },
          actions: { type: 'array', items: STRICT_STUDIO_ACTION_JSON_SCHEMA },
          permissions: { type: 'array', items: STRICT_STUDIO_PERMISSION_JSON_SCHEMA },
        },
      },
    },
  },
  phase4_tweak: {
    type: 'object',
    additionalProperties: false,
    required: ['assistant_visible_text', 'mode', 'patch', 'replacement_artifacts'],
    properties: {
      assistant_visible_text: { type: 'string' },
      mode: { type: 'string', enum: ['patch', 'replacement'] },
      patch: {
        type: 'object',
        additionalProperties: false,
        required: ['patch_operations'],
        properties: {
          patch_operations: {
            type: 'array',
            minItems: 1,
            items: STRICT_PATCH_OPERATION_JSON_SCHEMA,
          },
        },
      },
      replacement_artifacts: {
        type: 'object',
        additionalProperties: false,
        required: ['cell_manifest', 'entity_schemas', 'layouts', 'actions', 'permissions'],
        properties: {
          cell_manifest: STRICT_CELL_MANIFEST_JSON_SCHEMA,
          entity_schemas: { type: 'array', items: STRICT_ENTITY_JSON_SCHEMA },
          layouts: { type: 'array', items: STRICT_STUDIO_LAYOUT_JSON_SCHEMA },
          actions: { type: 'array', items: STRICT_STUDIO_ACTION_JSON_SCHEMA },
          permissions: { type: 'array', items: STRICT_STUDIO_PERMISSION_JSON_SCHEMA },
        },
      },
    },
  },
};

export function responseTextFormatForPhase(phase: StudioPhase): Record<string, unknown> {
  return {
    type: 'json_schema',
    name: `ikary_studio_${phase}`,
    schema: PHASE_JSON_SCHEMAS[phase],
    strict: true,
  };
}

export function responseJsonSchemaForPhase(phase: StudioPhase): Record<string, unknown> {
  return PHASE_JSON_SCHEMAS[phase];
}
