import { describe, expect, it } from 'vitest';
import { parseIkaryMcpEnvConfig } from './runtime-config';

describe('parseIkaryMcpEnvConfig', () => {
  it('uses defaults when no MCP env vars are set', () => {
    const config = parseIkaryMcpEnvConfig({});
    expect(config.url).toBeUndefined();
    expect(config.localUrl).toBe('http://localhost:4502/mcp');
    expect(config.publicUrl).toBe('https://public.ikary.co/mcp');
  });

  it('honors an explicit IKARY_MCP_URL override', () => {
    const config = parseIkaryMcpEnvConfig({ IKARY_MCP_URL: 'http://staging.ikary.co/mcp' });
    expect(config.url).toBe('http://staging.ikary.co/mcp');
  });

  it('lets the local and public URLs be overridden independently', () => {
    const config = parseIkaryMcpEnvConfig({
      IKARY_MCP_LOCAL_URL: 'http://localhost:9999/mcp',
      IKARY_MCP_PUBLIC_URL: 'https://canary.ikary.co/mcp',
    });
    expect(config.localUrl).toBe('http://localhost:9999/mcp');
    expect(config.publicUrl).toBe('https://canary.ikary.co/mcp');
  });
});
