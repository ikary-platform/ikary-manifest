import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { DiscoveryService } from '../services/discovery.service';
import type { RegistryService } from '../services/registry.service';
import type { GuidanceService } from '../services/guidance.service';
import type { ValidationService } from '../services/validation.service';
import { registerDiscoveryTools } from './tools/discovery.tools';
import { registerRegistryTools } from './tools/registry.tools';
import { registerGuidanceTools } from './tools/guidance.tools';
import { registerValidationTools } from './tools/validation.tools';

export interface McpServices {
  discovery: DiscoveryService;
  registry: RegistryService;
  guidance: GuidanceService;
  validation: ValidationService;
}

export function registerAllTools(server: McpServer, services: McpServices): void {
  registerDiscoveryTools(server, services.discovery);
  registerRegistryTools(server, services.registry);
  registerGuidanceTools(server, services.guidance);
  registerValidationTools(server, services.validation);
}
