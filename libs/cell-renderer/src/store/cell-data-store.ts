import type { AuditEvent, EntityVersion } from '@ikary/cell-contract';

export type { AuditEvent, EntityVersion, FieldDiff } from '@ikary/cell-contract';

export interface CellDataStore {
  /** All rows for an entity. Reactive — re-renders when data changes. */
  getRows(entityKey: string): Record<string, unknown>[];
  /** Single row by id. Returns undefined if not found. */
  getOne(entityKey: string, id: string): Record<string, unknown> | undefined;
  /** Persists a new row with a generated id. Returns the created record. */
  create(entityKey: string, data: Record<string, unknown>): Record<string, unknown> | Promise<Record<string, unknown>>;
  /** Updates an existing row by id. Returns the updated record or undefined. */
  update(
    entityKey: string,
    id: string,
    patch: Record<string, unknown>,
  ): Record<string, unknown> | undefined | Promise<Record<string, unknown> | undefined>;
  /** Whether the list query for this entity is still loading from the API. */
  isListLoading(entityKey: string): boolean;
  /** Soft-deletes a record by id. Returns true if deleted, false if not found. */
  delete(entityKey: string, id: string, expectedVersion: number): boolean | Promise<boolean>;
  /** Rolls back to a specific version by creating a new version with historic data. */
  rollback(entityKey: string, id: string, toVersion: number): Record<string, unknown> | undefined;
  /** Returns all versions for a record, newest first. */
  getVersions(entityKey: string, id: string): EntityVersion[];
  /** Returns all audit events for a record, newest first. */
  getAuditEvents(entityKey: string, id: string): AuditEvent[];
}
