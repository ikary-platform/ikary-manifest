import { z } from 'zod';
import { snakeCaseKeySchema } from '../../shared/identifiers';
import { FieldDefinitionSchema } from './field/FieldDefinitionSchema';
import { RelationDefinitionSchema } from './relation/RelationDefinitionSchema';
import { ComputedFieldDefinitionSchema } from './field/ComputedFieldDefinitionSchema';
import { LifecycleDefinitionSchema } from './lifecycle/LifecycleDefinitionSchema';
import { EventDefinitionSchema } from './event/EventDefinitionSchema';
import { CapabilityDefinitionSchema } from '../manifest/capability/CapabilityDefinitionSchema';
import { EntityPoliciesDefinitionSchema } from './policy/EntityPoliciesDefinitionSchema';
import { FieldPoliciesDefinitionSchema } from './policy/FieldPoliciesDefinitionSchema';
import { EntityValidationSchema } from './EntityValidationSchema';

/**
 * EntityDefinitionSchema
 * Purpose: validates one entity declaration in the manifest, composing
 * fields, relations, computed fields, lifecycle, events, capabilities, policies,
 * and entity-level validation declarations.
 */
export const EntityDefinitionSchema = z
  .object({
    key: snakeCaseKeySchema,
    name: z.string().min(1),
    pluralName: z.string().min(1),
    fields: z.array(FieldDefinitionSchema),
    relations: z.array(RelationDefinitionSchema).optional(),
    computed: z.array(ComputedFieldDefinitionSchema).optional(),
    lifecycle: LifecycleDefinitionSchema.optional(),
    events: EventDefinitionSchema.optional(),
    capabilities: z.array(CapabilityDefinitionSchema).optional(),
    policies: EntityPoliciesDefinitionSchema.optional(),
    fieldPolicies: FieldPoliciesDefinitionSchema.optional(),
    validation: EntityValidationSchema.optional(),
    governance: z
      .object({
        tier: z.enum(['tier-1', 'tier-2', 'tier-3']).default('tier-2'),
        rollbackEnabled: z.boolean().default(true),
        maxRollbackDepth: z.number().int().positive().optional(),
      })
      .optional(),
  })
  .strict();
