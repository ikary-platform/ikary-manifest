import { Module } from '@nestjs/common';
import { ServicesModule } from './services/services.module';
import { McpModule } from './mcp/mcp.module';
import { ApiModule } from './api/api.module';
import { HealthController } from './health.controller';

@Module({
  imports: [ServicesModule, McpModule, ApiModule],
  controllers: [HealthController],
})
export class AppModule {}
