import type { EntityDefinition, FieldDefinition } from '@ikary/cell-contract';
import type { MockResponse } from './types';
import { generateSeedRecords } from './SeedDataGenerator';

interface FilterRule {
  field: string;
  operator: string;
  value?: unknown;
}

interface FilterGroup {
  operator: 'and' | 'or';
  rules: (FilterRule | FilterGroup)[];
}

function isFilterGroup(obj: unknown): obj is FilterGroup {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'operator' in obj &&
    'rules' in obj &&
    Array.isArray((obj as FilterGroup).rules)
  );
}

export class MockEntityStore {
  private records = new Map<string, Record<string, unknown>>();
  private stringFieldKeys: string[];

  constructor(private entityDef: EntityDefinition) {
    this.stringFieldKeys = entityDef.fields
      .filter((f: FieldDefinition) => f.type === 'string' || f.type === 'text')
      .map((f: FieldDefinition) => f.key);
  }

  list(query: {
    page?: number;
    pageSize?: number;
    sortField?: string;
    sortDir?: string;
    search?: string;
    filter?: unknown;
  }): MockResponse {
    let results = Array.from(this.records.values());

    if (query.filter) {
      results = this.applyFilterGroup(results, query.filter as FilterGroup);
    }

    if (query.search) {
      const term = query.search.toLowerCase();
      results = results.filter((r) =>
        this.stringFieldKeys.some((k) =>
          String(r[k] ?? '').toLowerCase().includes(term),
        ),
      );
    }

    if (query.sortField) {
      const dir = query.sortDir === 'desc' ? -1 : 1;
      const field = query.sortField;
      results.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (typeof aVal === 'string' && typeof bVal === 'string')
          return aVal.localeCompare(bVal) * dir;
        if (typeof aVal === 'number' && typeof bVal === 'number')
          return (aVal - bVal) * dir;
        return String(aVal).localeCompare(String(bVal)) * dir;
      });
    }

    const total = results.length;
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const start = (page - 1) * pageSize;
    const sliced = results.slice(start, start + pageSize);
    const hasMore = start + pageSize < total;

    return {
      status: 200,
      body: {
        data: sliced,
        total,
        page,
        pageSize,
        hasMore,
        meta: { requestId: crypto.randomUUID() },
      },
      headers: { 'Content-Type': 'application/json' },
    };
  }

  getById(id: string): MockResponse {
    const record = this.records.get(id);
    if (!record) {
      return {
        status: 404,
        body: { error: 'Not Found', message: `Record ${id} not found` },
        headers: { 'Content-Type': 'application/json' },
      };
    }
    return {
      status: 200,
      body: { data: record, meta: { requestId: crypto.randomUUID() } },
      headers: { 'Content-Type': 'application/json' },
    };
  }

  create(body: Record<string, unknown>): MockResponse {
    const now = new Date().toISOString();
    const record: Record<string, unknown> = {
      ...body,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      createdBy: 'playground-user',
      updatedBy: 'playground-user',
      deletedAt: null,
      deletedBy: null,
      version: 1,
    };

    if (this.entityDef.lifecycle && !record[this.entityDef.lifecycle.field]) {
      record[this.entityDef.lifecycle.field] = this.entityDef.lifecycle.initial;
    }

    this.records.set(record.id as string, record);

    return {
      status: 201,
      body: { data: record, meta: { requestId: crypto.randomUUID() } },
      headers: { 'Content-Type': 'application/json' },
    };
  }

  update(id: string, body: Record<string, unknown>): MockResponse {
    const existing = this.records.get(id);
    if (!existing) {
      return {
        status: 404,
        body: { error: 'Not Found', message: `Record ${id} not found` },
        headers: { 'Content-Type': 'application/json' },
      };
    }

    const updated: Record<string, unknown> = {
      ...existing,
      ...body,
      id: existing.id,
      createdAt: existing.createdAt,
      createdBy: existing.createdBy,
      updatedAt: new Date().toISOString(),
      updatedBy: 'playground-user',
      version: (existing.version as number) + 1,
    };

    this.records.set(id, updated);

    return {
      status: 200,
      body: { data: updated, meta: { requestId: crypto.randomUUID() } },
      headers: { 'Content-Type': 'application/json' },
    };
  }

  delete(id: string): MockResponse {
    if (!this.records.has(id)) {
      return {
        status: 404,
        body: { error: 'Not Found', message: `Record ${id} not found` },
        headers: { 'Content-Type': 'application/json' },
      };
    }

    this.records.delete(id);

    return {
      status: 200,
      body: {
        data: { id, deleted: true },
        meta: { requestId: crypto.randomUUID() },
      },
      headers: { 'Content-Type': 'application/json' },
    };
  }

  executeCapability(
    capKey: string,
    id: string | null,
    body: Record<string, unknown>,
  ): MockResponse {
    const cap = this.entityDef.capabilities?.find(
      (c: any) => c.key === capKey,
    );
    if (!cap) {
      return {
        status: 404,
        body: { error: 'Capability not found', message: `Capability ${capKey} not found` },
        headers: { 'Content-Type': 'application/json' },
      };
    }

    if ((cap as any).type === 'transition' && id) {
      const record = this.records.get(id);
      if (!record) {
        return {
          status: 404,
          body: { error: 'Not Found', message: `Record ${id} not found` },
          headers: { 'Content-Type': 'application/json' },
        };
      }

      if (this.entityDef.lifecycle) {
        const transition = this.entityDef.lifecycle.transitions?.find(
          (t: any) => t.key === ((cap as any).transition || capKey),
        );
        if (transition) {
          record[this.entityDef.lifecycle.field] = (transition as any).to;
          record.updatedAt = new Date().toISOString();
          record.version = (record.version as number) + 1;
          this.records.set(id, record);
        }
      }

      return {
        status: 200,
        body: { data: record, meta: { requestId: crypto.randomUUID() } },
        headers: { 'Content-Type': 'application/json' },
      };
    }

    if (id) {
      const record = this.records.get(id);
      if (!record) {
        return {
          status: 404,
          body: { error: 'Not Found', message: `Record ${id} not found` },
          headers: { 'Content-Type': 'application/json' },
        };
      }
      return {
        status: 200,
        body: { data: record, meta: { requestId: crypto.randomUUID() } },
        headers: { 'Content-Type': 'application/json' },
      };
    }

    return {
      status: 200,
      body: {
        data: { capability: capKey, status: 'completed', ...body },
        meta: { requestId: crypto.randomUUID() },
      },
      headers: { 'Content-Type': 'application/json' },
    };
  }

  seed(count: number): void {
    const records = generateSeedRecords(this.entityDef, count);
    for (const r of records) {
      this.records.set(r.id as string, r);
    }
  }

  reset(): void {
    this.records.clear();
  }

  getRecordCount(): number {
    return this.records.size;
  }

  private applyFilterGroup(
    records: Record<string, unknown>[],
    group: FilterGroup,
  ): Record<string, unknown>[] {
    if (!group || !group.rules || group.rules.length === 0) return records;

    return records.filter((record) => {
      const results = group.rules.map((rule) => {
        if (isFilterGroup(rule)) {
          return this.applyFilterGroup([record], rule).length > 0;
        }
        return this.evaluateRule(record, rule);
      });

      if (group.operator === 'or') {
        return results.some(Boolean);
      }
      return results.every(Boolean);
    });
  }

  private evaluateRule(
    record: Record<string, unknown>,
    rule: FilterRule,
  ): boolean {
    const fieldValue = record[rule.field];
    const ruleValue = rule.value;

    switch (rule.operator) {
      case 'eq':
        return fieldValue === ruleValue;
      case 'neq':
        return fieldValue !== ruleValue;
      case 'gt':
        return (fieldValue as number) > (ruleValue as number);
      case 'gte':
        return (fieldValue as number) >= (ruleValue as number);
      case 'lt':
        return (fieldValue as number) < (ruleValue as number);
      case 'lte':
        return (fieldValue as number) <= (ruleValue as number);
      case 'contains':
        return String(fieldValue ?? '').toLowerCase().includes(
          String(ruleValue ?? '').toLowerCase(),
        );
      case 'startsWith':
        return String(fieldValue ?? '').toLowerCase().startsWith(
          String(ruleValue ?? '').toLowerCase(),
        );
      case 'endsWith':
        return String(fieldValue ?? '').toLowerCase().endsWith(
          String(ruleValue ?? '').toLowerCase(),
        );
      case 'in':
        return Array.isArray(ruleValue) && ruleValue.includes(fieldValue);
      case 'notIn':
        return Array.isArray(ruleValue) && !ruleValue.includes(fieldValue);
      case 'isNull':
        return fieldValue == null;
      case 'isNotNull':
        return fieldValue != null;
      default:
        return true;
    }
  }
}
