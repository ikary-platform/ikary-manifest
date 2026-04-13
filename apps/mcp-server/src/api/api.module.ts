import { Module } from '@nestjs/common';
import { ServicesModule } from '../services/services.module';
import { DiscoveryController } from './discovery.controller';
import { JsonSchemaController } from './json-schema.controller';
import { RegistryPrimitivesController, RegistryExamplesController } from './registry.controller';
import { GuidanceController } from './guidance.controller';
import { ValidationController } from './validation.controller';
import { JsonSchemaService } from '../services/json-schema.service';

@Module({
  imports: [ServicesModule],
  controllers: [
    DiscoveryController,
    JsonSchemaController,
    RegistryPrimitivesController,
    RegistryExamplesController,
    GuidanceController,
    ValidationController,
  ],
  providers: [JsonSchemaService],
})
export class ApiModule {}
