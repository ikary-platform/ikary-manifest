import { z } from 'zod';

export const FormFieldVariantSchema = z.enum(['standard', 'checkbox', 'choice-group', 'relation']);

export const FormFieldStandardControlSchema = z.enum([
  'text',
  'number',
  'email',
  'password',
  'textarea',
  'select',
  'date',
  'toggle',
]);

export const FormFieldMessageToneSchema = z.enum(['error', 'warning', 'success']);

export const FormFieldOptionSchema = z
  .object({
    key: z.string().min(1),
    label: z.string().min(1),
    value: z.string().min(1),
    description: z.string().min(1).optional(),
    disabled: z.boolean().optional(),
  })
  .strict();

export const FormFieldMessageSchema = z
  .object({
    tone: FormFieldMessageToneSchema,
    text: z.string().min(1),
  })
  .strict();

const FormFieldBaseSchema = z
  .object({
    type: z.literal('form-field'),

    key: z.string().min(1),

    helpText: z.string().min(1).optional(),
    smallTip: z.string().min(1).optional(),

    required: z.boolean().optional(),
    readonly: z.boolean().optional(),
    disabled: z.boolean().optional(),
    loading: z.boolean().optional(),

    message: FormFieldMessageSchema.optional(),

    dense: z.boolean().optional(),
    testId: z.string().min(1).optional(),
  })
  .strict();

export const FormFieldStandardPresentationSchema = FormFieldBaseSchema.extend({
  variant: z.literal('standard'),
  control: FormFieldStandardControlSchema,
  label: z.string().min(1),
  placeholder: z.string().min(1).optional(),
  options: z.array(FormFieldOptionSchema).min(1).optional(),
});

export const FormFieldCheckboxPresentationSchema = FormFieldBaseSchema.extend({
  variant: z.literal('checkbox'),
  label: z.string().min(1),
});

export const FormFieldChoiceGroupPresentationSchema = FormFieldBaseSchema.extend({
  variant: z.literal('choice-group'),
  legend: z.string().min(1),
  options: z.array(FormFieldOptionSchema).min(1),
});

// ── Relation variant ──────────────────────────────────────────────────────────

/**
 * FormFieldRelationPresentation is declared manually (not inferred) so that
 * createFields can self-reference FormFieldPresentation recursively.
 */
export type FormFieldRelationPresentation = {
  type: 'form-field';
  key: string;
  helpText?: string;
  smallTip?: string;
  required?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  loading?: boolean;
  message?: { tone: 'error' | 'warning' | 'success'; text: string };
  dense?: boolean;
  testId?: string;
  variant: 'relation';
  label: string;
  createPolicy: 'create' | 'attach' | 'create-or-attach';
  /** Entity key of the related entity (e.g. 'company'). */
  targetEntity: string;
  /** Field key on the related entity used as autocomplete label. */
  displayField?: string;
  placeholder?: string;
  /**
   * Pre-populated by buildEntityCreatePresentation.
   * Derived at runtime by useRelationRuntime if absent.
   */
  createFields?: FormFieldPresentation[];
};

/**
 * Union of all form field presentation variants.
 * Declared manually to support the recursive FormFieldRelationPresentation.
 */
export type FormFieldPresentation =
  | z.infer<typeof FormFieldStandardPresentationSchema>
  | z.infer<typeof FormFieldCheckboxPresentationSchema>
  | z.infer<typeof FormFieldChoiceGroupPresentationSchema>
  | FormFieldRelationPresentation;

/**
 * Relation field schema — uses z.lazy for the self-referential createFields
 * field. Must be declared after the FormFieldPresentation type alias above.
 */
export const FormFieldRelationPresentationSchema = FormFieldBaseSchema.extend({
  variant: z.literal('relation'),
  label: z.string().min(1),
  createPolicy: z.enum(['create', 'attach', 'create-or-attach']),
  targetEntity: z.string().min(1),
  displayField: z.string().min(1).optional(),
  placeholder: z.string().min(1).optional(),
  /**
   * Pre-populated by buildEntityCreatePresentation; derived at runtime if absent.
   * Uses z.lazy to handle the circular reference with FormFieldPresentationSchema.
   */
  createFields: z.array(z.lazy(() => FormFieldPresentationSchema)).optional(),
});

/**
 * Discriminated union of all form field variants.
 * Typed explicitly as z.ZodType<FormFieldPresentation> to break the recursive
 * type inference cycle introduced by FormFieldRelationPresentation.createFields.
 */
export const FormFieldPresentationSchema: z.ZodType<FormFieldPresentation> = z
  .discriminatedUnion('variant', [
    FormFieldStandardPresentationSchema,
    FormFieldCheckboxPresentationSchema,
    FormFieldChoiceGroupPresentationSchema,
    FormFieldRelationPresentationSchema,
  ])
  .superRefine((value, ctx) => {
    if (value.variant === 'standard') {
      if (value.control === 'select' && (!value.options || value.options.length === 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['options'],
          message: 'options are required when control is "select"',
        });
      }

      if (value.control !== 'select' && value.options) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['options'],
          message: 'options are only allowed when control is "select"',
        });
      }
    }

    const options = value.variant === 'standard' || value.variant === 'choice-group' ? value.options : undefined;

    if (!options) return;

    const optionKeys = options.map((option) => option.key);
    const duplicateOptionKeys = optionKeys.filter((key, index) => optionKeys.indexOf(key) !== index);

    for (const key of new Set(duplicateOptionKeys)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: `duplicate option key "${key}"`,
      });
    }

    const optionValues = options.map((option) => option.value);
    const duplicateOptionValues = optionValues.filter(
      (optionValue, index) => optionValues.indexOf(optionValue) !== index,
    );

    for (const optionValue of new Set(duplicateOptionValues)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: `duplicate option value "${optionValue}"`,
      });
    }
  });

export type FormFieldOption = z.infer<typeof FormFieldOptionSchema>;
export type FormFieldVariant = z.infer<typeof FormFieldVariantSchema>;
export type FormFieldStandardControl = z.infer<typeof FormFieldStandardControlSchema>;
export type FormFieldMessageTone = z.infer<typeof FormFieldMessageToneSchema>;
