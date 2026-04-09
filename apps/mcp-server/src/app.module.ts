import { Module } from '@nestjs/common';
import { ServicesModule } from './services/services.module';
import { McpModule } from './mcp/mcp.module';
import { ApiModule } from './api/api.module';
import { HealthController } from './health.controller';
import { DatabaseService } from '@ikary/system-db-core';
import { SystemLogModule } from '@ikary/system-log-core/server';
import { DatabaseModule } from './database.module';

@Module({
  imports: [
    DatabaseModule,
    ServicesModule,
    McpModule,
    ApiModule,
    SystemLogModule.register({
      databaseProviderToken: DatabaseService,
      service: 'mcp-server',
      pretty: process.env.NODE_ENV !== 'production',
    }),
  ],
  controllers: [HealthController],
})
export class AppModule {}
