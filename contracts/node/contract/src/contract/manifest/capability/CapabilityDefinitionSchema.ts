import { z } from 'zod';
import { CapabilityInputDefinitionSchema } from './CapabilityInputDefinitionSchema';

export const CapabilityScopeSchema = z.enum(['entity', 'selection', 'global']);

const CapabilityBaseSchema = z.object({
  key: z.string().min(1),
  description: z.string().min(1).optional(),
  icon: z.string().min(1).optional(),
  visible: z.boolean().optional(),
  confirm: z.boolean().optional(),
  scope: CapabilityScopeSchema.optional(),
  inputs: z.array(CapabilityInputDefinitionSchema).optional(),
});

export const CapabilityDefinitionSchema = z.discriminatedUnion('type', [
  CapabilityBaseSchema.extend({
    type: z.literal('transition'),
    transition: z.string().min(1),
  }).strict(),

  CapabilityBaseSchema.extend({
    type: z.literal('mutation'),
    updates: z.record(z.unknown()),
  }).strict(),

  CapabilityBaseSchema.extend({
    type: z.literal('workflow'),
    workflow: z.string().min(1),
  }).strict(),

  CapabilityBaseSchema.extend({
    type: z.literal('export'),
    format: z.enum(['pdf', 'csv', 'xlsx', 'json']),
  }).strict(),

  CapabilityBaseSchema.extend({
    type: z.literal('integration'),
    provider: z.string().min(1),
    operation: z.string().min(1).optional(),
  }).strict(),
]);

export type CapabilityDefinition = z.infer<typeof CapabilityDefinitionSchema>;
