import { Module } from '@nestjs/common';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { SystemAiModule } from '@ikary/system-ai/server';
import { CellAiModule } from '@ikary/cell-ai/server';
import { HealthController } from './health.controller';
import { ChatModule } from './chat/chat.module';
import { BlueprintModule } from './blueprint/blueprint.module';
import { buildAiRuntimeConfig, parseEnv } from './config/env.config';

const env = parseEnv();
const aiConfig = buildAiRuntimeConfig(env);

const cwdExamples = resolve(process.cwd(), 'manifests', 'examples');
const repoExamples = resolve(__dirname, '..', '..', '..', 'manifests', 'examples');
const examplesDir = env.EXAMPLES_DIR
  ? resolve(env.EXAMPLES_DIR)
  : existsSync(cwdExamples)
    ? cwdExamples
    : repoExamples;

@Module({
  imports: [
    SystemAiModule.forRoot(aiConfig),
    CellAiModule.forRoot({ blueprints: { examplesDir } }),
    ChatModule,
    BlueprintModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

export { env, aiConfig };
