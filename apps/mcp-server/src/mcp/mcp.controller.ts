import { Controller, Post, Req, Res, Get, Delete, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { Request, Response } from 'express';
import { DiscoveryService } from '../services/discovery.service';
import { RegistryService } from '../services/registry.service';
import { GuidanceService } from '../services/guidance.service';
import { ValidationService } from '../services/validation.service';
import { registerAllTools } from './mcp-server.factory';
import { registerDocResources } from './resources/docs.resources';

@ApiTags('mcp')
@Controller('mcp')
export class McpController {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly registry: RegistryService,
    private readonly guidance: GuidanceService,
    private readonly validation: ValidationService,
  ) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary: 'MCP Streamable HTTP endpoint',
    description: 'Stateless MCP transport for JSON-RPC requests. Use tools/list to discover available tools.',
  })
  async handleMcp(@Req() req: Request, @Res() res: Response): Promise<void> {
    const server = this.createServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

    res.on('close', () => {
      transport.close();
      server.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  }

  @Get()
  @ApiExcludeEndpoint()
  handleGet(@Res() res: Response): void {
    res.status(405).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method Not Allowed. Use POST for MCP requests.' },
      id: null,
    });
  }

  @Delete()
  @ApiExcludeEndpoint()
  handleDelete(@Res() res: Response): void {
    res.status(405).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method Not Allowed. Use POST for MCP requests.' },
      id: null,
    });
  }

  private createServer(): McpServer {
    const server = new McpServer(
      { name: 'ikary-manifest', version: '0.1.0' },
      { capabilities: { tools: {}, resources: {} } },
    );

    registerAllTools(server, {
      discovery: this.discovery,
      registry: this.registry,
      guidance: this.guidance,
      validation: this.validation,
    });

    registerDocResources(server, {
      discovery: this.discovery,
      registry: this.registry,
    });

    return server;
  }
}
