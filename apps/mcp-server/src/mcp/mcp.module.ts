import { Module } from '@nestjs/common';
import { ServicesModule } from '../services/services.module';
import { McpController } from './mcp.controller';

@Module({
  imports: [ServicesModule],
  controllers: [McpController],
})
export class McpModule {}
