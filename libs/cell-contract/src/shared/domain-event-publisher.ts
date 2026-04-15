import type { DomainEventEnvelope } from '../contract/manifest/domain-event/DomainEventEnvelopeSchema.js';

/**
 * Decoupled event emission port.
 *
 * The OSS runtime calls `publish()` after every entity mutation.
 * Adapters (outbox, in-memory, null) implement this interface.
 * No transport opinion lives here.
 */
export interface DomainEventPublisher {
  publish(events: DomainEventEnvelope[]): Promise<void>;
}
