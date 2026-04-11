import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { WorkspaceRepository } from './workspace.repository';
import { WorkspaceService } from './workspace.service';

@Module({
  imports: [DatabaseModule],
  providers: [WorkspaceRepository, WorkspaceService],
  exports: [WorkspaceRepository, WorkspaceService],
})
export class WorkspaceModule {}
