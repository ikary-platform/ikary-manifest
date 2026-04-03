import { z } from 'zod';

export const ValidationScopeSchema = z.enum([
  'field',
  'entity',
  'cross_entity',
  'lifecycle',
  'persistence',
  'authorization',
]);
