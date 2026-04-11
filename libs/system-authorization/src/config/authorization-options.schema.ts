import { z } from 'zod';
import type { ScopeType, TargetType } from '../interfaces/authorization.types';

export const authorizationModeSchema = z.enum(['feature', 'domain', 'both']);
export const assignmentLevelSchema = z.enum(['user', 'user-role', 'user-group', 'user-role-group']);

export const databaseConfigSchema = z.object({
  connectionString: z.string().min(1),
  ssl: z.boolean().default(false),
  maxPoolSize: z.number().int().min(1).max(100).default(20),
});

export const authorizationModuleOptionsSchema = z.object({
  database: databaseConfigSchema,
  mode: authorizationModeSchema.default('both'),
  assignmentLevel: assignmentLevelSchema.default('user-role-group'),
});

export type AuthorizationModuleOptions = z.infer<typeof authorizationModuleOptionsSchema>;
export type AuthorizationMode = z.infer<typeof authorizationModeSchema>;
export type AssignmentLevel = z.infer<typeof assignmentLevelSchema>;

export function getAllowedScopeTypes(mode: AuthorizationMode): ScopeType[] {
  if (mode === 'feature') {
    return ['FEATURE'];
  }

  if (mode === 'domain') {
    return ['DOMAIN'];
  }

  return ['FEATURE', 'DOMAIN'];
}

export function getAllowedTargetTypes(level: AssignmentLevel): TargetType[] {
  if (level === 'user') {
    return ['USER'];
  }

  if (level === 'user-role') {
    return ['USER', 'ROLE'];
  }

  if (level === 'user-group') {
    return ['USER', 'GROUP'];
  }

  return ['USER', 'ROLE', 'GROUP'];
}
