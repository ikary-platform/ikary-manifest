import { Module } from '@nestjs/common';
import { ServicesModule } from '../services/services.module';
import { DiscoveryController } from './discovery.controller';
import { RegistryPrimitivesController, RegistryExamplesController } from './registry.controller';
import { GuidanceController } from './guidance.controller';
import { ValidationController } from './validation.controller';

@Module({
  imports: [ServicesModule],
  controllers: [
    DiscoveryController,
    RegistryPrimitivesController,
    RegistryExamplesController,
    GuidanceController,
    ValidationController,
  ],
})
export class ApiModule {}
