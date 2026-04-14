import { Injectable } from '@nestjs/common';

interface PiiPattern {
  type: string;
  pattern: RegExp;
  validate?: (match: string) => boolean;
}

function luhnCheck(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]!, 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

const PII_PATTERNS: PiiPattern[] = [
  {
    type: 'CREDIT_CARD',
    pattern: /\b(?:\d[ -]?){13,19}\b/g,
    validate: (match) => {
      const digits = match.replace(/\D/g, '');
      return digits.length >= 13 && digits.length <= 19 && luhnCheck(digits);
    },
  },
  { type: 'SSN', pattern: /\b\d{3}-\d{2}-\d{4}\b/g },
  { type: 'EMAIL', pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g },
  { type: 'PHONE', pattern: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g },
];

@Injectable()
export class PiiDetector {
  redact(input: string): { redacted: string; piiDetected: boolean } {
    // eslint-disable-next-line no-control-regex
    let result = input.normalize('NFKC').replace(/[\u00AD\u200B-\u200D\u2060\uFEFF]/g, '');
    let piiDetected = false;

    for (const { type, pattern, validate } of PII_PATTERNS) {
      const regex = new RegExp(pattern.source, pattern.flags);
      result = result.replace(regex, (match) => {
        if (validate && !validate(match)) return match;
        piiDetected = true;
        return `[REDACTED-${type}]`;
      });
    }
    return { redacted: result, piiDetected };
  }
}
