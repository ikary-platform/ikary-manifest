import { z } from 'zod';
import { FormSectionPresentationSchema } from '../form-section/FormSectionPresentationSchema';

export const IkaryFormModeSchema = z.enum(['draft-only', 'draft-and-commit', 'commit-only']);

export const IkaryFormAutosaveSchema = z
  .object({
    enabled: z.boolean().optional(),
    debounceMs: z.number().int().min(200).max(10000).optional(),
    saveOnBlur: z.boolean().optional(),
  })
  .strict();

export const IkaryFormActionLabelsSchema = z
  .object({
    saveDraft: z.string().min(1).optional(),
    commit: z.string().min(1).optional(),
    discard: z.string().min(1).optional(),
    retry: z.string().min(1).optional(),
    resolveConflict: z.string().min(1).optional(),
  })
  .strict();

export const IkaryFormPresentationSchema = z
  .object({
    type: z.literal('form'),

    key: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1).optional(),

    mode: IkaryFormModeSchema.optional(),
    autosave: IkaryFormAutosaveSchema.optional(),
    actionLabels: IkaryFormActionLabelsSchema.optional(),

    sections: z.array(FormSectionPresentationSchema).min(1),

    reviewRequired: z.boolean().optional(),
    readonly: z.boolean().optional(),
    disabled: z.boolean().optional(),
    dense: z.boolean().optional(),
    testId: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const sectionKeys = value.sections.map((section) => section.key);
    const duplicateSectionKeys = sectionKeys.filter((key, index) => sectionKeys.indexOf(key) !== index);

    for (const key of new Set(duplicateSectionKeys)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sections'],
        message: `duplicate section key "${key}"`,
      });
    }

    const mode = value.mode ?? 'draft-and-commit';
    if (mode === 'commit-only' && value.autosave?.enabled === true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['autosave', 'enabled'],
        message: 'autosave cannot be enabled when mode is "commit-only"',
      });
    }

    if (value.autosave?.debounceMs !== undefined && value.autosave.enabled !== true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['autosave', 'debounceMs'],
        message: 'autosave.debounceMs requires autosave.enabled=true',
      });
    }
  });

export type IkaryFormPresentation = z.infer<typeof IkaryFormPresentationSchema>;
export type IkaryFormMode = z.infer<typeof IkaryFormModeSchema>;

// Backward-compatible aliases for existing integrations.
export const FormModeSchema = IkaryFormModeSchema;
export const FormAutosaveSchema = IkaryFormAutosaveSchema;
export const FormActionLabelsSchema = IkaryFormActionLabelsSchema;
export const FormPresentationSchema = IkaryFormPresentationSchema;
export type FormPresentation = IkaryFormPresentation;
export type FormMode = IkaryFormMode;
