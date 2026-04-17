import { z } from 'zod';

export const mcpValidationErrorSchema = z.object({
  field: z.string().default(''),
  message: z.string(),
  path: z.string().optional(),
});
export type McpValidationError = z.infer<typeof mcpValidationErrorSchema>;

export const mcpValidateManifestResultSchema = z.object({
  valid: z.boolean(),
  errors: z.array(mcpValidationErrorSchema).default([]),
});
export type McpValidateManifestResult = z.infer<typeof mcpValidateManifestResultSchema>;

export const mcpExplainErrorsResultSchema = z.object({
  guidance: z.array(z.object({
    field: z.string().default(''),
    message: z.string(),
    suggestion: z.string().optional(),
  })).default([]),
});
export type McpExplainErrorsResult = z.infer<typeof mcpExplainErrorsResultSchema>;

export const mcpManifestSchemaResultSchema = z.object({
  version: z.string().optional(),
  rootFields: z.array(z.unknown()).optional(),
  specFields: z.array(z.unknown()).optional(),
  semanticRules: z.array(z.unknown()).optional(),
}).passthrough();
export type McpManifestSchemaResult = z.infer<typeof mcpManifestSchemaResultSchema>;

export const ikaryMcpEndpointConfigSchema = z.object({
  url: z.string().url().optional(),
  localUrl: z.string().url().default('http://localhost:4502/mcp'),
  publicUrl: z.string().url().default('https://public.ikary.co/mcp'),
});
export type IkaryMcpEndpointConfig = z.infer<typeof ikaryMcpEndpointConfigSchema>;
