import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { z } from 'zod';
import {
  ikaryMcpEndpointConfigSchema,
  mcpExplainErrorsResultSchema,
  mcpManifestSchemaResultSchema,
  mcpValidateManifestResultSchema,
  type IkaryMcpEndpointConfig,
  type McpExplainErrorsResult,
  type McpManifestSchemaResult,
  type McpValidateManifestResult,
  type McpValidationError,
} from '../shared/mcp.types';

const CLIENT_NAME = 'ikary-system-mcp';
const CLIENT_VERSION = '0.3.0';

interface ConnectedClient {
  client: Client;
  endpoint: string;
}

export interface IkaryMcpClientOptions {
  config?: Partial<IkaryMcpEndpointConfig>;
  /** Optional override for the underlying client constructor (test injection). */
  clientFactory?: (endpoint: string) => Promise<Client>;
}

/**
 * Client for the Ikary MCP server. Lazily connects on first call. Tries the
 * explicit `url` (if set) first, otherwise the local endpoint, then the public
 * endpoint. Records the resolved endpoint so callers can surface degradation.
 */
export class IkaryMcpClient {
  private readonly config: IkaryMcpEndpointConfig;
  private readonly clientFactory: (endpoint: string) => Promise<Client>;
  private connectionPromise: Promise<ConnectedClient> | null = null;

  constructor(options: IkaryMcpClientOptions = {}) {
    this.config = ikaryMcpEndpointConfigSchema.parse(options.config ?? {});
    this.clientFactory = options.clientFactory ?? defaultClientFactory;
  }

  /** Explicit endpoint that the last successful connection used, or null if never connected. */
  async resolvedEndpoint(): Promise<string> {
    const connection = await this.connect();
    return connection.endpoint;
  }

  async validateManifest(manifest: unknown): Promise<McpValidateManifestResult> {
    return this.callStructured('validate_manifest', { manifest }, mcpValidateManifestResultSchema);
  }

  async explainErrors(errors: McpValidationError[]): Promise<McpExplainErrorsResult> {
    return this.callStructured('explain_validation_errors', { errors }, mcpExplainErrorsResultSchema);
  }

  async getManifestSchema(version?: string): Promise<McpManifestSchemaResult> {
    return this.callStructured(
      'get_manifest_schema',
      version ? { version } : {},
      mcpManifestSchemaResultSchema,
    );
  }

  /**
   * Get the canonical schema rendered as text suitable for embedding in a system
   * prompt. Returns the MCP server's own summary block (the first content block)
   * which already reads as a human-friendly contract description.
   */
  async getManifestSchemaText(version?: string): Promise<string> {
    const result = await this.callRaw('get_manifest_schema', version ? { version } : {});
    return readSummary(result);
  }

  /** Close the underlying connection if open. Safe to call multiple times. */
  async close(): Promise<void> {
    if (!this.connectionPromise) return;
    try {
      const connection = await this.connectionPromise;
      await connection.client.close();
    } catch {
      // Closing a never-connected client is a no-op.
    } finally {
      this.connectionPromise = null;
    }
  }

  private async connect(): Promise<ConnectedClient> {
    if (this.connectionPromise) return this.connectionPromise;
    this.connectionPromise = this.tryConnect();
    try {
      return await this.connectionPromise;
    } catch (error) {
      this.connectionPromise = null;
      throw error;
    }
  }

  private async tryConnect(): Promise<ConnectedClient> {
    const endpoints = this.candidateEndpoints();
    const errors: string[] = [];
    for (const endpoint of endpoints) {
      try {
        const client = await this.clientFactory(endpoint);
        return { client, endpoint };
      } catch (error) {
        errors.push(`${endpoint}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    throw new Error(`Ikary MCP unreachable. Tried: ${errors.join(' | ')}`);
  }

  private candidateEndpoints(): string[] {
    if (this.config.url) return [this.config.url];
    return [this.config.localUrl, this.config.publicUrl];
  }

  private async callStructured<S extends z.ZodTypeAny>(
    name: string,
    args: Record<string, unknown>,
    schema: S,
  ): Promise<z.output<S>> {
    const result = await this.callRaw(name, args);
    return schema.parse(extractStructuredPayload(result));
  }

  private async callRaw(name: string, args: Record<string, unknown>): Promise<McpToolResult> {
    const connection = await this.connect();
    const result = await connection.client.callTool({ name, arguments: args });
    return result as McpToolResult;
  }
}

interface McpTextContent {
  type: 'text';
  text: string;
}

interface McpToolResult {
  content: McpTextContent[];
  isError?: boolean;
}

async function defaultClientFactory(endpoint: string): Promise<Client> {
  const client = new Client({ name: CLIENT_NAME, version: CLIENT_VERSION }, {});
  const transport = new StreamableHTTPClientTransport(new URL(endpoint));
  await client.connect(transport);
  return client;
}

function readSummary(result: McpToolResult): string {
  return result.content?.[0]?.text ?? '';
}

function extractStructuredPayload(result: McpToolResult): unknown {
  const dataBlock = result.content?.[1];
  if (!dataBlock) {
    return {};
  }
  try {
    return JSON.parse(dataBlock.text);
  } catch {
    return {};
  }
}
