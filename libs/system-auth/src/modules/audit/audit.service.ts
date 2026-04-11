import { Inject, Injectable, Optional } from '@nestjs/common';
import type { Queryable } from '../../database/database.service';
import { AuditRepository } from './audit.repository';
import type { AuditLogCreateInput } from './audit.types';
import { LogService } from '@ikary/system-log-core/server';

@Injectable()
export class AuditService {
  constructor(
    @Inject(AuditRepository) private readonly audit: AuditRepository,
    @Optional() @Inject(LogService) private readonly logger: LogService | null,
  ) {}

  async log(input: AuditLogCreateInput, client?: Queryable): Promise<void> {
    try {
      await this.audit.insert(input, client);
    } catch (error) {
      this.logger?.error('Failed to write audit log', {
        operation: 'auth.audit.write',
      });
    }
  }
}
