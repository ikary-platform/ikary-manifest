import { z } from 'zod';
import { localeCodeSchema } from './message.types';

export const localizationValidationSchema = z
  .object({
    failOnMissing: z.boolean().default(false),
    failOnDuplicate: z.boolean().default(true),
  })
  .default({
    failOnMissing: false,
    failOnDuplicate: true,
  });

export const localizationConfigSchema = z
  .object({
    defaultLocale: localeCodeSchema,
    supportedLocales: z.array(localeCodeSchema).min(1),
    outputDir: z.string().min(1).default('locales'),
    validation: localizationValidationSchema,
  })
  .superRefine((value, ctx) => {
    const locales = new Set(value.supportedLocales);
    if (!locales.has(value.defaultLocale)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['supportedLocales'],
        message: 'supportedLocales must include defaultLocale.',
      });
    }

    if (locales.size !== value.supportedLocales.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['supportedLocales'],
        message: 'supportedLocales must not contain duplicates.',
      });
    }
  });

export type LocalizationConfig = z.infer<typeof localizationConfigSchema>;
export type LocalizationValidationConfig = z.infer<typeof localizationValidationSchema>;

export function defineLocalizationConfig(input: LocalizationConfig): LocalizationConfig {
  return localizationConfigSchema.parse(input);
}
