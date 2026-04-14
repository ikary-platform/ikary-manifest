import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { AI_ERROR_CODES } from '../../shared/error-codes';

export interface SanitizationContext {
  taskName: string;
  correlationId: string;
}

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(?:all\s+)?previous\s+instructions?/i,
  /disregard\s+(?:all\s+)?(?:previous\s+)?instructions?/i,
  /forget\s+(?:everything|all|prior|previous)/i,
  /<\/system>/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /you\s+are\s+now\s+(?:a\s+)?(?:different|new|an?)\s+(?:AI|assistant|model|bot)/i,
  /act\s+as\s+(?:a\s+)?(?:(?:different|new|an?)\s+)?(?:AI|assistant|model|bot)/i,
  /pretend\s+(?:you\s+are|to\s+be)\s+(?:a\s+)?(?:different|new|an?)\s+(?:AI|assistant|model|bot)/i,
  /do\s+(?:anything|whatever)\s+(?:now|i\s+say)/i,
  /jailbreak/i,
  /bypass\s+(?:your\s+)?(?:restrictions?|limits?|filters?|safety|guidelines?)/i,
  /override\s+(?:your\s+)?(?:restrictions?|instructions?|safety|guidelines?)/i,
  /system\s+prompt\s*:/i,
  /from\s+now\s+on\b/i,
  /(?:ignore|forget|disregard)\s+(?:all\s+)?(?:the\s+)?above/i,
  /(?:output|print|reveal|show)\s+(?:the\s+)?(?:system\s+)?(?:prompt|instructions?)/i,
  /you\s+are\s+no\s+longer\b/i,
  /(?:adopt|take\s+on)\s+(?:the\s+)?(?:persona|role|identity)\s+of/i,
];

@Injectable()
export class PromptSanitizer {
  sanitize(input: string, ctx: SanitizationContext): string {
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        throw new UnprocessableEntityException({
          code: AI_ERROR_CODES.PROMPT_INJECTION_DETECTED,
          message: 'Input contains prohibited content.',
          correlationId: ctx.correlationId,
          taskName: ctx.taskName,
        });
      }
    }
    return input;
  }
}
