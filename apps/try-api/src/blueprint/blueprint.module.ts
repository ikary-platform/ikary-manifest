import { Module } from '@nestjs/common';
import { BlueprintController } from './blueprint.controller';

@Module({
  controllers: [BlueprintController],
})
export class BlueprintModule {}
