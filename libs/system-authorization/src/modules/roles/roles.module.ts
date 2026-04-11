import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { CodeNormalizerService } from '../../services/code-normalizer.service';
import { RolesRepository } from './roles.repository';
import { RolesService } from './roles.service';

@Module({
  imports: [DatabaseModule],
  providers: [RolesRepository, RolesService, CodeNormalizerService],
  exports: [RolesRepository, RolesService],
})
export class RolesModule {}
