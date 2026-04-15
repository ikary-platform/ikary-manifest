import type { DomainEventPublisher, DomainEventEnvelope } from '@ikary/cell-contract';

/** No-op publisher — default in local/preview mode. Emits nothing. */
export class NullDomainEventPublisher implements DomainEventPublisher {
  async publish(_events: DomainEventEnvelope[]): Promise<void> {}
}
