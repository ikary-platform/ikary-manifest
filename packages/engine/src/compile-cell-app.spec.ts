import { describe, it, expect } from 'vitest';
import { compileCellApp, isValidationResult } from './compile-cell-app';
import { deriveEntityScopeRegistry, deriveManifestScopeRegistry } from './derive-scope-registry';
import { buildEntityDetailPath, buildEntityListPath } from './entity-path-helpers';
import type { CellManifestV1 } from '@ikary-manifest/contract';

const validManifest: CellManifestV1 = {
  apiVersion: 'ikary.io/v1alpha1',
  kind: 'Cell',
  metadata: { key: 'support', name: 'Support Cell', version: '1.0.0' },
  spec: {
    mount: { mountPath: '/support', landingPage: 'ticket-list' },
    entities: [
      {
        key: 'ticket',
        name: 'Ticket',
        pluralName: 'Tickets',
        fields: [
          { key: 'subject', type: 'string', name: 'Subject', list: { visible: true }, form: { visible: true } },
          { key: 'status', type: 'enum', name: 'Status', enumValues: ['open', 'closed'], list: { visible: true } },
          { key: 'notes', type: 'text', name: 'Notes', list: { visible: false }, form: { visible: true } },
        ],
        lifecycle: {
          field: 'status',
          initial: 'open',
          states: ['open', 'closed'],
          transitions: [
            {
              key: 'close',
              from: 'open',
              to: 'closed',
              label: 'Close Ticket',
            },
          ],
        },
        capabilities: [
          { key: 'assign', type: 'workflow', workflow: 'assign-ticket' },
          { key: 'escalate', type: 'mutation', updates: { priority: 'high' } },
        ],
      },
    ],
    pages: [
      { key: 'ticket-list', type: 'entity-list', title: 'Tickets', path: '/tickets', entity: 'ticket' },
      { key: 'ticket-detail', type: 'entity-detail', title: 'Ticket Detail', path: '/tickets/:id', entity: 'ticket' },
    ],
    navigation: {
      items: [{ type: 'page', key: 'nav-tickets', pageKey: 'ticket-list', label: 'Tickets', order: 0 }],
    },
  },
};

describe('compileCellApp', () => {
  it('returns normalized manifest for a valid input', () => {
    const result = compileCellApp(validManifest);
    expect(isValidationResult(result)).toBe(false);
    expect((result as CellManifestV1).metadata.name).toBe('Support Cell');
  });

  it('returns validation errors for invalid JSON structure', () => {
    const result = compileCellApp({ foo: 'bar' } as unknown as CellManifestV1);
    expect(isValidationResult(result)).toBe(true);
    expect((result as { valid: boolean }).valid).toBe(false);
  });

  it('returns business rule errors for bad landingPage', () => {
    const bad = {
      ...validManifest,
      spec: { ...validManifest.spec, mount: { ...validManifest.spec.mount, landingPage: 'nonexistent' } },
    };
    const result = compileCellApp(bad);
    expect(isValidationResult(result)).toBe(true);
    expect((result as { valid: boolean }).valid).toBe(false);
  });

  it('derives entity scope registry with lifecycle + capabilities', () => {
    const entity = validManifest.spec.entities?.[0];
    expect(entity).toBeDefined();

    const scopes = deriveEntityScopeRegistry(entity!);
    expect(scopes).toContain('ticket.view');
    expect(scopes).toContain('ticket.create');
    expect(scopes).toContain('ticket.update');
    expect(scopes).toContain('ticket.delete');
    expect(scopes).toContain('ticket.close');
    expect(scopes).toContain('ticket.assign');
    expect(scopes).toContain('ticket.escalate');
  });

  it('derives manifest scope registry from all entities', () => {
    const scopes = deriveManifestScopeRegistry(validManifest);
    expect(scopes).toContain('ticket.view');
    expect(scopes).toContain('ticket.close');
  });

  it('builds entity paths from manifest pages', () => {
    const listPath = buildEntityListPath(validManifest, 'ticket');
    const detailPath = buildEntityDetailPath(validManifest, 'ticket', '123');

    expect(listPath).toBe('/tickets');
    expect(detailPath).toBe('/tickets/123');
  });
});
