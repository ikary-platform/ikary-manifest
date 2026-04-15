import { describe, it, expect } from 'vitest';
import { NullDomainEventPublisher } from './null-event-publisher.js';
import type { DomainEventEnvelope } from '@ikary/cell-contract';

function buildEvent(): DomainEventEnvelope {
  return {
    event_id: 'e1',
    event_name: 'test.event',
    version: 1,
    timestamp: new Date().toISOString(),
    tenant_id: 'tenant',
    workspace_id: 'workspace',
    cell_id: 'cell',
    actor: { type: 'system', id: 'system' },
    entity: { type: 'item', id: 'item-1' },
    data: {},
    previous: {},
    metadata: {},
  };
}

describe('NullDomainEventPublisher', () => {
  it('resolves without throwing for an empty array', async () => {
    const publisher = new NullDomainEventPublisher();
    await expect(publisher.publish([])).resolves.toBeUndefined();
  });

  it('resolves without throwing for a populated events array', async () => {
    const publisher = new NullDomainEventPublisher();
    await expect(publisher.publish([buildEvent(), buildEvent()])).resolves.toBeUndefined();
  });
});
