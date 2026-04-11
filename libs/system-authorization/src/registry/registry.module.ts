import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CodeNormalizerService } from '../services/code-normalizer.service';
import { RegistryRepository } from './registry.repository';
import { RegistryService } from './registry.service';
import { PermissionNamespaceRegistry } from './permission-namespace.registry';

@Module({
  imports: [DatabaseModule],
  providers: [RegistryRepository, RegistryService, CodeNormalizerService, PermissionNamespaceRegistry],
  exports: [RegistryRepository, RegistryService, CodeNormalizerService, PermissionNamespaceRegistry],
})
export class RegistryModule {}
