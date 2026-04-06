import { z } from 'zod';

export const ValidationSeveritySchema = z.enum(['error', 'warning']);
