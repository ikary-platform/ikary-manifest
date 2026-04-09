import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { LogService } from '@ikary/system-log-core/server';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get(LogService);
  app.useLogger(logger);

  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('IKARY Cell Runtime API')
    .setDescription('Local entity CRUD API for IKARY manifests. SQLite-backed, manifest-driven schema.')
    .setVersion('0.1.0')
    .addTag('entities', 'Entity record CRUD with versioning and audit log')
    .addTag('health', 'Health check')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env['PORT'] ?? 4000;
  await app.listen(port);

  logger.log(`cell-runtime-api running on http://localhost:${port}`, { operation: 'server.ready' });
  logger.log(`Swagger docs at http://localhost:${port}/api/docs`, { operation: 'server.ready' });
}

bootstrap();
