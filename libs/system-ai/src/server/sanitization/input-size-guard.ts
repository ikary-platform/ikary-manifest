import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { AI_ERROR_CODES } from '../../shared/error-codes';

@Injectable()
export class InputSizeGuard {
  enforce(input: string, limitBytes: number, correlationId: string): void {
    const byteLength = Buffer.byteLength(input, 'utf8');
    if (byteLength > limitBytes) {
      throw new UnprocessableEntityException({
        code: AI_ERROR_CODES.INPUT_TOO_LARGE,
        message: `Input exceeds maximum size of ${limitBytes} bytes.`,
        correlationId,
      });
    }
  }
}
