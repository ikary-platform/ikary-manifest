import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LogService } from '@ikary/system-log-core/server';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get(LogService);
  app.useLogger(logger);

  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('IKARY Manifest API')
    .setDescription(
      'Public contract intelligence API for the IKARY manifest language. ' +
      'Discover schemas, browse UI primitives, validate manifests, and get structured guidance.',
    )
    .setVersion('0.1.0')
    .addTag('schemas', 'Contract discovery — manifest, entity, page, and capability schemas')
    .addTag('primitives', 'UI primitive catalog and presentation contracts')
    .addTag('examples', 'Sample manifest catalog')
    .addTag('guidance', 'Structural recommendations, page suggestions, relation analysis, error explanations')
    .addTag('validation', 'Manifest, entity, and page validation + normalization')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3100;
  await app.listen(port);

  logger.log(`IKARY Manifest API running on http://localhost:${port}`, { operation: 'server.ready' });
  logger.log(`MCP endpoint at POST http://localhost:${port}/mcp`, { operation: 'server.ready' });
}

bootstrap();
