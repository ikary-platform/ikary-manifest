import { Body, Controller, Inject, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { ManifestGeneratorService } from '@ikary/cell-ai/server';
import { manifestGenerationInputSchema } from '@ikary/cell-ai';

const streamRequestSchema = manifestGenerationInputSchema;

@Controller('chat')
export class ChatController {
  constructor(
    @Inject(ManifestGeneratorService) private readonly generator: ManifestGeneratorService,
  ) {}

  @Post('stream')
  async stream(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: unknown,
  ): Promise<void> {
    const parse = streamRequestSchema.safeParse(body);
    if (!parse.success) {
      res.status(400).json({ code: 'INVALID_REQUEST', issues: parse.error.issues });
      return;
    }
    const input = parse.data;
    const correlationId = randomUUID();

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const abortController = new AbortController();
    req.on('close', () => abortController.abort());

    const writeEvent = (event: unknown) => {
      res.write(`data: ${safeStringify(event)}\n\n`);
    };

    try {
      writeEvent({ type: 'meta', correlationId });
      for await (const event of this.generator.streamManifest(input, correlationId, abortController.signal)) {
        writeEvent(event);
      }
    } catch (err) {
      writeEvent({
        type: 'error',
        code: 'STREAM_FAILED',
        message: (err as Error).message,
      });
    } finally {
      res.end();
    }
  }
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return JSON.stringify({ type: 'error', code: 'SERIALIZE_FAILED', message: 'Unable to serialize event.' });
  }
}

// Silence unused-import warning; z retained for future schema enrichment.
void z;
