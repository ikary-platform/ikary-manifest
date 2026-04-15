import { describe, it, expect, vi } from 'vitest';
import { OutboxDomainEventPublisher } from './outbox-event-publisher.js';
import type { OutboxRepository } from './outbox-repository.js';
import type { DomainEventEnvelope } from '@ikary/cell-contract';

function buildEvent(id: string): DomainEventEnvelope {
  return {
    event_id: id,
    event_name: 'entity.created',
    version: 1,
    timestamp: new Date().toISOString(),
    tenant_id: 't',
    workspace_id: 'w',
    cell_id: 'c',
    actor: { type: 'system', id: 'system' },
    entity: { type: 'item', id: 'item-1' },
    data: {},
    previous: {},
    metadata: {},
  };
}

describe('OutboxDomainEventPublisher', () => {
  it('calls outbox.insert once for each event in the array', async () => {
    const insertMock = vi.fn().mockResolvedValue(undefined);
    const mockOutbox = { insert: insertMock } as unknown as OutboxRepository;

    const publisher = new OutboxDomainEventPublisher(mockOutbox);
    await publisher.publish([buildEvent('a'), buildEvent('b'), buildEvent('c')]);

    expect(insertMock).toHaveBeenCalledTimes(3);
    expect(insertMock).toHaveBeenNthCalledWith(1, expect.objectContaining({ event_id: 'a' }), undefined);
    expect(insertMock).toHaveBeenNthCalledWith(2, expect.objectContaining({ event_id: 'b' }), undefined);
    expect(insertMock).toHaveBeenNthCalledWith(3, expect.objectContaining({ event_id: 'c' }), undefined);
  });

  it('resolves without error for an empty array', async () => {
    const insertMock = vi.fn();
    const mockOutbox = { insert: insertMock } as unknown as OutboxRepository;
    const publisher = new OutboxDomainEventPublisher(mockOutbox);

    await expect(publisher.publish([])).resolves.toBeUndefined();
    expect(insertMock).not.toHaveBeenCalled();
  });
});
