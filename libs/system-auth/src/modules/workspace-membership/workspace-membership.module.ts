import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { WorkspaceMembershipRepository } from './workspace-membership.repository';
import { WorkspaceMembershipService } from './workspace-membership.service';

@Module({
  imports: [DatabaseModule],
  providers: [WorkspaceMembershipRepository, WorkspaceMembershipService],
  exports: [WorkspaceMembershipRepository, WorkspaceMembershipService],
})
export class WorkspaceMembershipModule {}
