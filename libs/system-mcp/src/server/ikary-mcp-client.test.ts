import { describe, expect, it, vi } from 'vitest';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { IkaryMcpClient } from './ikary-mcp-client';

interface FakeContent { type: 'text'; text: string }
interface FakeResult { content: FakeContent[]; isError?: boolean }

function fakeClient(handler: (name: string, args: Record<string, unknown>) => FakeResult): Client {
  return {
    callTool: vi.fn(async ({ name, arguments: args }: { name: string; arguments: Record<string, unknown> }) => handler(name, args)),
    close: vi.fn(async () => undefined),
  } as unknown as Client;
}

function asFactory(impl: (endpoint: string) => Promise<Client>): (endpoint: string) => Promise<Client> {
  return impl;
}

describe('IkaryMcpClient', () => {
  it('routes validateManifest through the configured endpoint and parses the structured payload', async () => {
    const fake = fakeClient(() => ({
      content: [
        { type: 'text', text: 'manifest valid' },
        { type: 'text', text: JSON.stringify({ valid: true, errors: [] }) },
      ],
    }));
    const client = new IkaryMcpClient({
      config: { url: 'http://test/mcp' },
      clientFactory: asFactory(async () => fake),
    });
    const result = await client.validateManifest({ apiVersion: 'ikary.co/v1alpha1' });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('falls through from local to public when the local factory throws', async () => {
    const factory = vi
      .fn<(endpoint: string) => Promise<Client>>()
      .mockRejectedValueOnce(new Error('ECONNREFUSED'))
      .mockResolvedValueOnce(fakeClient(() => ({
        content: [
          { type: 'text' as const, text: 'schema body' },
          { type: 'text' as const, text: JSON.stringify({ version: 'v1alpha1' }) },
        ],
      })));
    const client = new IkaryMcpClient({
      config: { localUrl: 'http://localhost:4502/mcp', publicUrl: 'https://public.ikary.co/mcp' },
      clientFactory: asFactory(factory),
    });
    const text = await client.getManifestSchemaText();
    expect(text).toBe('schema body');
    expect(factory).toHaveBeenCalledTimes(2);
    expect(await client.resolvedEndpoint()).toBe('https://public.ikary.co/mcp');
  });

  it('throws an aggregated error when every candidate endpoint fails', async () => {
    const factory = vi.fn<(endpoint: string) => Promise<Client>>().mockImplementation(async () => {
      throw new Error('boom');
    });
    const client = new IkaryMcpClient({
      config: { localUrl: 'http://a/mcp', publicUrl: 'http://b/mcp' },
      clientFactory: asFactory(factory),
    });
    await expect(client.validateManifest({})).rejects.toThrow(/Ikary MCP unreachable/);
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('throws a Zod parse error when the data block is missing on a strict tool', async () => {
    const fake = fakeClient(() => ({
      content: [{ type: 'text', text: 'no data block' }],
    }));
    const client = new IkaryMcpClient({
      config: { url: 'http://t/mcp' },
      clientFactory: asFactory(async () => fake),
    });
    await expect(client.validateManifest({})).rejects.toThrow(/valid|Required/);
  });

  it('returns the human-readable summary text from getManifestSchemaText', async () => {
    const fake = fakeClient(() => ({
      content: [
        { type: 'text', text: 'Manifest must have apiVersion ...' },
        { type: 'text', text: JSON.stringify({ version: 'v1alpha1' }) },
      ],
    }));
    const client = new IkaryMcpClient({
      config: { url: 'http://t/mcp' },
      clientFactory: asFactory(async () => fake),
    });
    expect(await client.getManifestSchemaText()).toBe('Manifest must have apiVersion ...');
  });

  it('explainErrors forwards the error array verbatim', async () => {
    const handler = vi.fn((_name: string, _args: Record<string, unknown>): FakeResult => ({
      content: [
        { type: 'text', text: 'guidance' },
        { type: 'text', text: JSON.stringify({ guidance: [{ field: 'metadata.key', message: 'required', suggestion: 'add it' }] }) },
      ],
    }));
    const fake = fakeClient(handler);
    const client = new IkaryMcpClient({
      config: { url: 'http://t/mcp' },
      clientFactory: asFactory(async () => fake),
    });
    const result = await client.explainErrors([{ field: 'metadata.key', message: 'required' }]);
    expect(result.guidance[0]?.suggestion).toBe('add it');
    expect(handler).toHaveBeenCalledWith('explain_validation_errors', { errors: [{ field: 'metadata.key', message: 'required' }] });
  });
});
