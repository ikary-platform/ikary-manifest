import { Module } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import { RegistryService } from './registry.service';
import { GuidanceService } from './guidance.service';
import { ValidationService } from './validation.service';

@Module({
  providers: [DiscoveryService, RegistryService, GuidanceService, ValidationService],
  exports: [DiscoveryService, RegistryService, GuidanceService, ValidationService],
})
export class ServicesModule {}
