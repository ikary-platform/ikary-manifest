import { z } from 'zod';
import { snakeCaseKeySchema } from '../../../shared/identifiers';
import { FieldValidationSchema } from './FieldValidationSchema';
import { DisplayDefinitionSchema } from '../display/DisplayDefinitionSchema';

/**
 * FieldDefinitionSchema
 * Purpose: validates one entity field definition declared in a Cell manifest,
 * including list/form metadata and nested object fields.
 */
const FieldTypeSchema = z.enum(['string', 'text', 'number', 'boolean', 'date', 'datetime', 'enum', 'object']);

const FieldOperationMetaSchema = z.object({
  visible: z.boolean().optional(),
  order: z.number().optional(),
  placeholder: z.string().optional(),
});

export type FieldDefinitionNode = {
  key: string;
  type: 'string' | 'text' | 'number' | 'boolean' | 'date' | 'datetime' | 'enum' | 'object';
  name: string;
  enumValues?: string[];
  system?: boolean;
  helpText?: string;
  smallTip?: string;
  readonly?: boolean;
  sensitive?: 'pii' | 'secret' | 'credential' | 'token' | 'binary-reference';
  list?: { visible?: boolean; sortable?: boolean; searchable?: boolean; filterable?: boolean };
  form?: { visible?: boolean; placeholder?: string };
  create?: { visible?: boolean; order?: number; placeholder?: string };
  edit?: { visible?: boolean; order?: number; placeholder?: string };
  display?: z.infer<typeof DisplayDefinitionSchema>;
  validation?: z.infer<typeof FieldValidationSchema>;
  fields?: FieldDefinitionNode[];
};

export const FieldDefinitionSchema: z.ZodType<FieldDefinitionNode> = z.lazy(() =>
  z.object({
    key: snakeCaseKeySchema,
    type: FieldTypeSchema,
    name: z.string().min(1),
    enumValues: z.array(z.string()).optional(),
    system: z.boolean().optional(),
    helpText: z.string().optional(),
    smallTip: z.string().optional(),
    readonly: z.boolean().optional(),
    sensitive: z.enum(['pii', 'secret', 'credential', 'token', 'binary-reference']).optional(),
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
    create: FieldOperationMetaSchema.optional(),
    edit: FieldOperationMetaSchema.optional(),
    display: DisplayDefinitionSchema.optional(),
    validation: FieldValidationSchema.optional(),
    fields: z.array(FieldDefinitionSchema).optional(),
  }),
);

export type FieldDefinitionInput = z.infer<typeof FieldDefinitionSchema>;
