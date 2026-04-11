import { Injectable } from '@nestjs/common';
import { createHmac, randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

@Injectable()
export class HashService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  hashOpaqueToken(token: string, secret: string): string {
    return createHmac('sha256', secret).update(token).digest('hex');
  }

  generateOpaqueToken(byteLength = 32): string {
    return randomBytes(byteLength).toString('base64url');
  }

  generateNumericCode(length = 6): string {
    const max = 10 ** length;
    const n = Math.floor(Math.random() * max);
    return n.toString().padStart(length, '0');
  }
}
