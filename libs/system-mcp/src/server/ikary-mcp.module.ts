import { DynamicModule, Module } from '@nestjs/common';
import { IkaryMcpClient, type IkaryMcpClientOptions } from './ikary-mcp-client';

export const IKARY_MCP_OPTIONS = Symbol('IKARY_MCP_OPTIONS');

@Module({})
export class IkaryMcpModule {
  static forRoot(options: IkaryMcpClientOptions = {}): DynamicModule {
    return {
      module: IkaryMcpModule,
      global: true,
      providers: [
        { provide: IKARY_MCP_OPTIONS, useValue: options },
        {
          provide: IkaryMcpClient,
          useFactory: (opts: IkaryMcpClientOptions) => new IkaryMcpClient(opts),
          inject: [IKARY_MCP_OPTIONS],
        },
      ],
      exports: [IkaryMcpClient],
    };
  }
}
