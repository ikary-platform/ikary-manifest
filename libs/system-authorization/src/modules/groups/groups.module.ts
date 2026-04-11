import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { CodeNormalizerService } from '../../services/code-normalizer.service';
import { GroupsRepository } from './groups.repository';
import { GroupsService } from './groups.service';

@Module({
  imports: [DatabaseModule],
  providers: [GroupsRepository, GroupsService, CodeNormalizerService],
  exports: [GroupsRepository, GroupsService],
})
export class GroupsModule {}
