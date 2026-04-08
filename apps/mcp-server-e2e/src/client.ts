import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const BASE_URL = process.env.IKARY_API_URL ?? 'https://public.ikary.co';
const MCP_URL = `${BASE_URL}/mcp`;

// ── REST ─────────────────────────────────────────────────────────────────────

export async function restGet(path: string): Promise<Response> {
  return fetch(`${BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
  });
}

export async function restPost(path: string, body: unknown): Promise<Response> {
  return fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });
}

// ── MCP ───────────────────────────────────────────────────────────────────────

export interface McpTextContent {
  type: 'text';
  text: string;
}

export interface McpToolResult {
  content: McpTextContent[];
  isError?: boolean;
}

export async function createMcpClient(): Promise<Client> {
  const client = new Client({ name: 'ikary-e2e', version: '1.0.0' }, {});
  const transport = new StreamableHTTPClientTransport(new URL(MCP_URL));
  await client.connect(transport);
  return client;
}

/** Extract the human-readable summary from an MCP tool result (first content block). */
export function getMcpSummary(result: McpToolResult): string {
  return result.content[0]?.text ?? '';
}

/**
 * Parse the structured data payload from an MCP tool result (second content block).
 * mcpResult(summary, data) in the server places data in content[1] as JSON.stringify(data).
 */
export function parseMcpData<T>(result: McpToolResult): T {
  const block = result.content[1];
  if (!block) throw new Error('MCP result has no data block (content[1] missing)');
  return JSON.parse(block.text) as T;
}
