import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { RegistryModule } from '../../registry/registry.module';
import { CodeNormalizerService } from '../../services/code-normalizer.service';
import { GroupsModule } from '../groups/groups.module';
import { RolesModule } from '../roles/roles.module';
import { AssignmentsRepository } from './assignments.repository';
import { AssignmentsService } from './assignments.service';

@Module({
  imports: [DatabaseModule, RegistryModule, RolesModule, GroupsModule],
  providers: [AssignmentsRepository, AssignmentsService, CodeNormalizerService],
  exports: [AssignmentsRepository, AssignmentsService],
})
export class AssignmentsModule {}
