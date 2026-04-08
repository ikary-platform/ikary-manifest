import { Module } from '@nestjs/common';
import { ServicesModule } from './services/services.module';
import { McpModule } from './mcp/mcp.module';
import { ApiModule } from './api/api.module';

@Module({
  imports: [ServicesModule, McpModule, ApiModule],
})
export class AppModule {}
