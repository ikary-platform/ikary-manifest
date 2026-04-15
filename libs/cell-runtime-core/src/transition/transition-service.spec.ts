import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DatabaseService, databaseConnectionOptionsSchema, sql } from '@ikary/system-db-core';
import { EntitySchemaManager } from '../entity/entity-schema-manager.js';
import { EntityRepository } from '../entity/entity-repository.js';
import { EntityService } from '../entity/entity-service.js';
import { AuditService } from '../audit/audit-service.js';
import { OutboxRepository } from '../outbox/outbox-repository.js';
import { TransitionService } from './transition-service.js';
import { EntityNotFoundError, InvalidTransitionError, VersionConflictError } from '../errors.js';
import type { CellRuntimeDatabase } from '../db/schema.js';
import type { CellManifestV1 } from '@ikary/cell-contract';
import type { LifecycleDefinition, LifecycleTransitionDefinition } from '@ikary/cell-contract';
import type { DomainEventEnvelope } from '@ikary/cell-contract';

const TEST_DB_URL =
  process.env['TEST_DATABASE_URL'] ?? 'postgres://ikary:ikary@localhost:5433/ikary_test';

const MANIFEST = {
  spec: {
    entities: [
      {
        key: 'invoice',
        name: 'Invoice',
        pluralName: 'Invoices',
        fields: [
          { key: 'title', type: 'string', name: 'Title' },
          { key: 'status', type: 'string', name: 'Status' },
        ],
      },
    ],
  },
} as unknown as CellManifestV1;

const LIFECYCLE: LifecycleDefinition = {
  field: 'status',
  initial: 'draft',
  states: ['draft', 'sent', 'paid', 'void'],
  transitions: [
    {
      key: 'send',
      from: 'draft',
      to: 'sent',
      label: 'Send',
      event: 'invoice.sent',
      hooks: ['notify_recipient', 'log_activity'],
    },
    {
      key: 'mark_paid',
      from: 'sent',
      to: 'paid',
      label: 'Mark Paid',
      // no explicit event — should fall back to 'entity.transitioned'
    },
    {
      key: 'void',
      from: 'draft',
      to: 'void',
      label: 'Void',
    },
  ],
};

describe('TransitionService', () => {
  let dbService: DatabaseService<CellRuntimeDatabase>;
  let entityService: EntityService;
  let outboxRepo: OutboxRepository;
  let transitionService: TransitionService;

  beforeEach(async () => {
    dbService = new DatabaseService<CellRuntimeDatabase>(
      databaseConnectionOptionsSchema.parse({ connectionString: TEST_DB_URL }),
    );
    for (const t of ['entity_invoice', 'audit_log', 'domain_event_outbox']) {
      try { await sql.raw(`DROP TABLE IF EXISTS ${t}`).execute(dbService.db); } catch { /* ignore */ }
    }
    const manager = new EntitySchemaManager(dbService);
    await manager.ensureSystemTables();
    await manager.initFromManifest(MANIFEST);

    const repo = new EntityRepository(dbService);
    const audit = new AuditService(dbService);
    outboxRepo = new OutboxRepository(dbService);
    entityService = new EntityService(dbService, repo, audit, outboxRepo);
    transitionService = new TransitionService(entityService);
  });

  afterEach(async () => {
    for (const t of ['entity_invoice', 'audit_log', 'domain_event_outbox']) {
      try { await sql.raw(`DROP TABLE IF EXISTS ${t}`).execute(dbService.db); } catch { /* ignore */ }
    }
    await dbService.destroy();
  });

  // ── happy path ────────────────────────────────────────────────────────────

  describe('execute — happy path', () => {
    it('returns the updated record with new state', async () => {
      const record = await entityService.create('invoice', { title: 'INV-001', status: 'draft' });
      const transition = LIFECYCLE.transitions.find((t) => t.key === 'send')!;

      const result = await transitionService.execute('invoice', record['id'] as string, LIFECYCLE, transition);

      expect(result['status']).toBe('sent');
    });

    it('increments the record version', async () => {
      const record = await entityService.create('invoice', { title: 'INV-002', status: 'draft' });
      const transition = LIFECYCLE.transitions.find((t) => t.key === 'send')!;

      const result = await transitionService.execute('invoice', record['id'] as string, LIFECYCLE, transition);

      expect(result['version']).toBe(2);
    });

    it('persists the state change in the database', async () => {
      const record = await entityService.create('invoice', { title: 'INV-003', status: 'draft' });
      const id = record['id'] as string;
      const transition = LIFECYCLE.transitions.find((t) => t.key === 'send')!;

      await transitionService.execute('invoice', id, LIFECYCLE, transition);

      const fetched = await entityService.findById('invoice', id);
      expect(fetched?.['status']).toBe('sent');
    });
  });

  // ── event naming ─────────────────────────────────────────────────────────

  describe('event naming', () => {
    it('uses transition.event as event_name in outbox', async () => {
      const record = await entityService.create('invoice', { title: 'INV-004', status: 'draft' });
      const id = record['id'] as string;
      const transition = LIFECYCLE.transitions.find((t) => t.key === 'send')!;

      await transitionService.execute('invoice', id, LIFECYCLE, transition);

      const rows = await outboxRepo.listUnprocessed();
      const transitionRow = rows.find(
        (r) => (r.payload as DomainEventEnvelope).event_name === 'invoice.sent',
      );
      expect(transitionRow).toBeDefined();
    });

    it('falls back to entity.transitioned when transition.event is undefined', async () => {
      const record = await entityService.create('invoice', { title: 'INV-005', status: 'draft' });
      const id = record['id'] as string;

      // Send first so we can mark_paid
      await transitionService.execute(
        'invoice', id, LIFECYCLE,
        LIFECYCLE.transitions.find((t) => t.key === 'send')!,
      );

      const mark_paid = LIFECYCLE.transitions.find((t) => t.key === 'mark_paid')!;
      await transitionService.execute('invoice', id, LIFECYCLE, mark_paid);

      const rows = await outboxRepo.listUnprocessed();
      const transitionRow = rows.find(
        (r) => (r.payload as DomainEventEnvelope).event_name === 'entity.transitioned',
      );
      expect(transitionRow).toBeDefined();
    });
  });

  // ── hooks ─────────────────────────────────────────────────────────────────

  describe('hook events', () => {
    it('writes entity.hook.invoked to outbox for each declared hook', async () => {
      const record = await entityService.create('invoice', { title: 'INV-006', status: 'draft' });
      const id = record['id'] as string;
      const transition = LIFECYCLE.transitions.find((t) => t.key === 'send')!;

      await transitionService.execute('invoice', id, LIFECYCLE, transition);

      const rows = await outboxRepo.listUnprocessed();
      const hookRows = rows.filter(
        (r) => (r.payload as DomainEventEnvelope).event_name === 'entity.hook.invoked',
      );
      expect(hookRows).toHaveLength(2); // notify_recipient + log_activity

      const hookKeys = hookRows.map(
        (r) => ((r.payload as DomainEventEnvelope).data as Record<string, unknown>)['hook_key'],
      );
      expect(hookKeys).toContain('notify_recipient');
      expect(hookKeys).toContain('log_activity');
    });

    it('does not write hook events when transition has no hooks', async () => {
      const record = await entityService.create('invoice', { title: 'INV-007', status: 'draft' });
      const id = record['id'] as string;
      const voidTransition = LIFECYCLE.transitions.find((t) => t.key === 'void')!;

      await transitionService.execute('invoice', id, LIFECYCLE, voidTransition);

      const rows = await outboxRepo.listUnprocessed();
      const hookRows = rows.filter(
        (r) => (r.payload as DomainEventEnvelope).event_name === 'entity.hook.invoked',
      );
      expect(hookRows).toHaveLength(0);
    });
  });

  // ── error cases ──────────────────────────────────────────────────────────

  describe('error cases', () => {
    it('throws InvalidTransitionError when current state does not match transition.from', async () => {
      const record = await entityService.create('invoice', { title: 'INV-008', status: 'sent' });
      const id = record['id'] as string;

      // 'send' transition requires from: 'draft', but current state is 'sent'
      const transition = LIFECYCLE.transitions.find((t) => t.key === 'send')!;

      await expect(
        transitionService.execute('invoice', id, LIFECYCLE, transition),
      ).rejects.toThrow(InvalidTransitionError);
    });

    it('throws EntityNotFoundError for a non-existent entity id', async () => {
      const transition = LIFECYCLE.transitions.find((t) => t.key === 'send')!;

      await expect(
        transitionService.execute('invoice', 'nonexistent-id', LIFECYCLE, transition),
      ).rejects.toThrow(EntityNotFoundError);
    });

    it('InvalidTransitionError message contains the transition key and state values', async () => {
      const record = await entityService.create('invoice', { title: 'INV-009', status: 'paid' });
      const id = record['id'] as string;
      const transition = LIFECYCLE.transitions.find((t) => t.key === 'send')!;

      await expect(
        transitionService.execute('invoice', id, LIFECYCLE, transition),
      ).rejects.toThrow(/send.*invoice.*paid.*draft/i);
    });
  });

  // ── without outbox ────────────────────────────────────────────────────────

  describe('without outbox in EntityService', () => {
    it('executes transition without error when EntityService has no outbox', async () => {
      const repo = new EntityRepository(dbService);
      const audit = new AuditService(dbService);
      const noOutboxEntityService = new EntityService(dbService, repo, audit, /* outbox */ undefined);
      const noOutboxTransitionService = new TransitionService(noOutboxEntityService);

      const record = await noOutboxEntityService.create('invoice', { title: 'INV-010', status: 'draft' });
      const id = record['id'] as string;
      const transition = LIFECYCLE.transitions.find((t) => t.key === 'send')!;

      const result = await noOutboxTransitionService.execute('invoice', id, LIFECYCLE, transition);
      expect(result['status']).toBe('sent');
    });
  });

  // ── optimistic lock ───────────────────────────────────────────────────────

  describe('optimistic lock', () => {
    it('throws VersionConflictError when record is modified between read and write', async () => {
      const record = await entityService.create('invoice', { title: 'INV-OL', status: 'draft' });
      const id = record['id'] as string;
      const transition = LIFECYCLE.transitions.find((t) => t.key === 'send')!;

      // Simulate the TOCTOU race: TransitionService's findById returns stale version 1
      // while the DB has already advanced to version 2.
      // The internal findById inside EntityService.update (which is NOT mocked) reads
      // the real DB value (v2), causing the expectedVersion(1) check to throw.
      vi.spyOn(entityService, 'findById').mockResolvedValueOnce({ ...record });

      // Advance the DB to version 2
      await entityService.update('invoice', id, { title: 'concurrent write' });

      // execute → reads stale v1 (mocked) → passes state check → update with expectedVersion=1
      // → internal findById sees v2 in DB → VersionConflictError
      await expect(
        transitionService.execute('invoice', id, LIFECYCLE, transition),
      ).rejects.toThrow(VersionConflictError);

      vi.restoreAllMocks();
    });
  });

  // ── full EntityRuntimeContext ──────────────────────────────────────────────

  describe('full EntityRuntimeContext', () => {
    it('hook envelope uses actor.type=user and carries all ctx fields when provided', async () => {
      const record = await entityService.create('invoice', { title: 'INV-011', status: 'draft' });
      const id = record['id'] as string;
      const transition = LIFECYCLE.transitions.find((t) => t.key === 'send')!;

      await transitionService.execute('invoice', id, LIFECYCLE, transition, {
        actorId: 'user-99',
        requestId: 'req-abc',
        tenantId: 'tenant-1',
        workspaceId: 'workspace-1',
        cellId: 'cell-1',
      });

      const rows = await outboxRepo.listUnprocessed();
      const hookRow = rows.find(
        (r) => (r.payload as DomainEventEnvelope).event_name === 'entity.hook.invoked',
      );
      const p = hookRow!.payload as DomainEventEnvelope;
      expect(p.actor.type).toBe('user');
      expect(p.actor.id).toBe('user-99');
      expect(p.tenant_id).toBe('tenant-1');
      expect(p.workspace_id).toBe('workspace-1');
      expect(p.cell_id).toBe('cell-1');
      expect((p.metadata as Record<string, unknown>)['requestId']).toBe('req-abc');
    });
  });
});
