import { z } from 'zod';
import { snakeCaseKeySchema } from '../../../shared/identifiers';

const RelationBaseSchema = z.object({
  key: snakeCaseKeySchema,
  label: z.string().min(1).optional(),
});

export const RelationDefinitionSchema = z.discriminatedUnion('relation', [
  RelationBaseSchema.extend({
    relation: z.literal('belongs_to'),
    entity: z.string().min(1),
    required: z.boolean().optional(),
    /**
     * Explicit foreign-key field name in the record.
     * Defaults to `${key}Id` by convention (e.g. key='company' → 'companyId').
     * Override only when the FK field name diverges from the convention.
     */
    foreignKey: z.string().optional(),
    /**
     * Governs how the relation FK is handled on entity create forms.
     * Absent → relation is invisible to the create system (FK is a plain string field).
     */
    createPolicy: z.enum(['create', 'attach', 'create-or-attach']).optional(),
    /** Field key on the related entity used as autocomplete label. */
    displayField: z.string().min(1).optional(),
  }).strict(),

  RelationBaseSchema.extend({
    relation: z.literal('has_many'),
    entity: z.string().min(1),
    foreignKey: z.string().min(1),
  }).strict(),

  RelationBaseSchema.extend({
    relation: z.literal('many_to_many'),
    entity: z.string().min(1),
    through: z.string().min(1),
    sourceKey: z.string().min(1),
    targetKey: z.string().min(1),
  }).strict(),

  RelationBaseSchema.extend({
    relation: z.literal('self'),
    kind: z.enum(['belongs_to', 'has_many', 'many_to_many']),
  }).strict(),

  RelationBaseSchema.extend({
    relation: z.literal('polymorphic'),
    typeField: z.string().min(1),
    idField: z.string().min(1),
    allowedEntities: z.array(z.string().min(1)).min(1).optional(),
  }).strict(),
]);
