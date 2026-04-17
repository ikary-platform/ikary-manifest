import { z } from 'zod';
import {
  ikaryMcpEndpointConfigSchema,
  type IkaryMcpEndpointConfig,
} from '../shared/mcp.types';

export const ikaryMcpEnvSchema = z.object({
  IKARY_MCP_URL: z.string().url().optional(),
  IKARY_MCP_LOCAL_URL: z.string().url().default('http://localhost:4502/mcp'),
  IKARY_MCP_PUBLIC_URL: z.string().url().default('https://public.ikary.co/mcp'),
});

export type IkaryMcpEnv = z.infer<typeof ikaryMcpEnvSchema>;

/** Parse MCP-related env vars into an IkaryMcpEndpointConfig. */
export function parseIkaryMcpEnvConfig(source: NodeJS.ProcessEnv = process.env): IkaryMcpEndpointConfig {
  const env = ikaryMcpEnvSchema.parse(source);
  return ikaryMcpEndpointConfigSchema.parse({
    url: env.IKARY_MCP_URL,
    localUrl: env.IKARY_MCP_LOCAL_URL,
    publicUrl: env.IKARY_MCP_PUBLIC_URL,
  });
}
