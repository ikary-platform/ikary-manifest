import type { DomainEventPublisher, DomainEventEnvelope } from '@ikary/cell-contract';
import type { Queryable } from '@ikary/system-db-core';
import type { CellRuntimeDatabase } from '../db/schema.js';
import type { OutboxRepository } from './outbox-repository.js';

export class OutboxDomainEventPublisher implements DomainEventPublisher {
  constructor(private readonly outbox: OutboxRepository) {}

  async publish(events: DomainEventEnvelope[], qb?: Queryable<CellRuntimeDatabase>): Promise<void> {
    for (const event of events) {
      await this.outbox.insert(event, qb);
    }
  }
}
