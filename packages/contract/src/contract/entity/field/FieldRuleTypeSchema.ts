import { z } from 'zod';

export const FieldRuleTypeSchema = z.enum([
  'required',
  'min_length',
  'max_length',
  'regex',
  'enum',
  'number_min',
  'number_max',
  'date',
  'future_date',
  'email',
]);
