import { z } from 'zod';

export const PolicyScopeSchema = z.enum(['public', 'tenant', 'workspace', 'owner', 'role', 'custom']);

export type PolicyScope = z.infer<typeof PolicyScopeSchema>;
