import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule, env, aiConfig } from './app.module';
import { logResolvedConfig } from './config/env.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  app.enableCors({ origin: true, credentials: true });

  logResolvedConfig(env, aiConfig);

  const port = Number(process.env.PORT ?? env.PORT);
  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`[try-api] listening on http://0.0.0.0:${port}`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[try-api] bootstrap failed', err);
  process.exit(1);
});
