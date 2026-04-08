import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { DiscoveryService } from './services/discovery.service';
import { RegistryService } from './services/registry.service';
import { GuidanceService } from './services/guidance.service';
import { ValidationService } from './services/validation.service';
import { registerAllTools } from './mcp/mcp-server.factory';
import { registerDocResources } from './mcp/resources/docs.resources';

async function main() {
  const server = new McpServer(
    { name: 'ikary-manifest', version: '0.1.0' },
    { capabilities: { tools: {}, resources: {} } },
  );

  const discovery = new DiscoveryService();
  const registry = new RegistryService();
  const guidance = new GuidanceService();
  const validation = new ValidationService();

  registerAllTools(server, { discovery, registry, guidance, validation });
  registerDocResources(server, { discovery, registry });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('MCP server failed to start:', err);
  process.exit(1);
});
