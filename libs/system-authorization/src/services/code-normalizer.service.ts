import { Injectable } from '@nestjs/common';
import { z } from 'zod';

const scopeCodeSchema = z
  .string()
  .trim()
  .min(1)
  .max(150)
  .regex(/^[A-Za-z0-9_.:-]+$/);

@Injectable()
export class CodeNormalizerService {
  normalizeScopeCode(raw: string): string {
    const parsed = scopeCodeSchema.parse(raw);
    return parsed.toUpperCase();
  }
}
