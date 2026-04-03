import { describe, expect, it } from 'vitest';
import type { CellManifestV1, EntityDefinition } from '../shared/types';
import { validateEntityRules } from './entity-rules';

function makeManifest(entities: EntityDefinition[]): CellManifestV1 {
  return {
    apiVersion: 'ikary.co/v1alpha1',
    kind: 'Cell',
    metadata: {
      key: 'entity-rules',
      name: 'Entity Rules',
      version: '1.0.0',
    },
    spec: {
      mount: {
        mountPath: '/',
        landingPage: 'dashboard',
      },
      pages: [
        {
          key: 'dashboard',
          type: 'dashboard',
          title: 'Dashboard',
          path: '/dashboard',
        },
      ],
      entities,
    },
  };
}

describe('validateEntityRules', () => {
  it('returns no errors when there are no entities', () => {
    const manifest = makeManifest([]);

    expect(validateEntityRules(manifest)).toEqual([]);
  });

  it('handles missing optional entity collections and optional nested collections', () => {
    const withoutEntities: CellManifestV1 = {
      apiVersion: 'ikary.co/v1alpha1',
      kind: 'Cell',
      metadata: {
        key: 'no-entities',
        name: 'No Entities',
        version: '1.0.0',
      },
      spec: {
        mount: {
          mountPath: '/',
          landingPage: 'dashboard',
        },
        pages: [
          {
            key: 'dashboard',
            type: 'dashboard',
            title: 'Dashboard',
            path: '/dashboard',
          },
        ],
      },
    };

    expect(validateEntityRules(withoutEntities)).toEqual([]);

    const entityWithOptionalArraysMissing: EntityDefinition = {
      key: 'optional',
      name: 'Optional',
      pluralName: 'Optionals',
      fields: [{ key: 'meta', type: 'object', name: 'Meta' }],
      events: {},
    };

    expect(validateEntityRules(makeManifest([entityWithOptionalArraysMissing]))).toEqual([]);
  });

  it('detects field, relation, computed, lifecycle, event, capability, and policy issues', () => {
    const invoice: EntityDefinition = {
      key: 'invoice',
      name: 'Invoice',
      pluralName: 'Invoices',
      fields: [
        { key: 'status', type: 'enum', name: 'Status' },
        { key: 'amount', type: 'number', name: 'Amount' },
        {
          key: 'meta',
          type: 'object',
          name: 'Meta',
          fields: [
            { key: 'createdAt', type: 'string', name: 'Created At' },
            {
              key: 'level1',
              type: 'object',
              name: 'Level 1',
              fields: [
                {
                  key: 'level2',
                  type: 'object',
                  name: 'Level 2',
                  fields: [{ key: 'deepLeaf', type: 'string', name: 'Deep Leaf' }],
                },
              ],
            },
          ],
        },
      ],
      relations: [
        { key: 'amount', relation: 'belongs_to', entity: 'user' },
        { key: 'manager', relation: 'self', kind: 'belongs_to' },
        { key: 'manager', relation: 'has_many', entity: 'user', foreignKey: 'manager_id' },
        { key: 'createdAt', relation: 'has_many', entity: 'audit', foreignKey: 'invoice_id' },
        { key: 'owner_id', relation: 'belongs_to', entity: 'user' },
      ],
      computed: [
        {
          key: 'amount',
          name: 'Amount Computed',
          type: 'number',
          formulaType: 'expression',
          expression: '1',
        },
        {
          key: 'owner_id',
          name: 'Owner Ref',
          type: 'string',
          formulaType: 'expression',
          expression: 'owner_id',
        },
        {
          key: 'createdAt',
          name: 'Created At Computed',
          type: 'datetime',
          formulaType: 'expression',
          expression: 'now()',
        },
        {
          key: 'agg_sum',
          name: 'Agg Sum',
          type: 'number',
          formulaType: 'aggregation',
          relation: 'owner_id',
          operation: 'sum',
        },
        {
          key: 'dup',
          name: 'Dup 1',
          type: 'string',
          formulaType: 'expression',
          expression: 'one',
        },
        {
          key: 'dup',
          name: 'Dup 2',
          type: 'string',
          formulaType: 'expression',
          expression: 'two',
        },
      ],
      lifecycle: {
        field: 'lifecycleStatus',
        initial: 'missing',
        states: ['draft', 'approved', 'draft'],
        transitions: [
          { key: 'approve', from: 'draft', to: 'approved' },
          { key: 'approve', from: 'ghost', to: 'void' },
        ],
      },
      events: {
        exclude: ['unknownField', 'amount'],
      },
      capabilities: [
        {
          key: 'capDup',
          type: 'transition',
          transition: 'missingTransition',
          inputs: [
            { key: 'assignee', type: 'select', options: [] },
            { key: 'assignee', type: 'entity', entity: '' },
          ],
        },
        { key: 'capDup', type: 'transition', transition: 'missingTransition' },
        { key: 'amount', type: 'mutation', updates: {} },
        { key: 'createdAt', type: 'workflow', workflow: 'wf.sync' },
      ],
      fieldPolicies: {
        missingField: { view: { scope: 'role' } },
        createdAt: { view: { scope: 'role' } },
      },
    };

    const task: EntityDefinition = {
      key: 'task',
      name: 'Task',
      pluralName: 'Tasks',
      fields: [{ key: 'name', type: 'string', name: 'Name' }],
      capabilities: [{ key: 'start', type: 'transition', transition: 'start' }],
    };

    const errors = validateEntityRules(makeManifest([invoice, task]));
    const messages = errors.map((error) => error.message);

    expect(messages.some((message) => message.includes('Enum field must have non-empty enumValues'))).toBe(true);
    expect(messages.some((message) => message.includes('exceeds max nesting depth of 3'))).toBe(true);
    expect(messages.some((message) => message.includes('is reserved by the base entity'))).toBe(true);

    expect(messages.some((message) => message.includes('Duplicate relation key: "manager"'))).toBe(true);
    expect(messages.some((message) => message.includes('Relation key "amount" conflicts with a field key'))).toBe(true);
    expect(
      messages.some((message) =>
        message.includes('Relation key "createdAt" conflicts with a reserved base entity field key'),
      ),
    ).toBe(true);
    expect(messages.some((message) => message.includes('belongs_to relation key must end with "_id"'))).toBe(true);
    expect(messages.some((message) => message.includes('self relation key must end with "_id"'))).toBe(true);

    expect(messages.some((message) => message.includes('Duplicate computed field key: "dup"'))).toBe(true);
    expect(messages.some((message) => message.includes('Computed field key "amount" conflicts with a field key'))).toBe(
      true,
    );
    expect(
      messages.some((message) => message.includes('Computed field key "owner_id" conflicts with a relation key')),
    ).toBe(true);
    expect(
      messages.some((message) =>
        message.includes('Computed field key "createdAt" conflicts with a reserved base entity field key'),
      ),
    ).toBe(true);
    expect(
      messages.some((message) => message.includes('Aggregation operation "sum" requires a "field" property')),
    ).toBe(true);

    expect(messages.some((message) => message.includes('lifecycle.field "lifecycleStatus" does not reference'))).toBe(
      true,
    );
    expect(
      messages.some((message) => message.includes('lifecycle.initial "missing" is not listed in lifecycle.states')),
    ).toBe(true);
    expect(messages.some((message) => message.includes('Duplicate lifecycle state: "draft"'))).toBe(true);
    expect(messages.some((message) => message.includes('Duplicate transition key: "approve"'))).toBe(true);
    expect(messages.some((message) => message.includes('from-state "ghost" is not in lifecycle.states'))).toBe(true);
    expect(messages.some((message) => message.includes('to-state "void" is not in lifecycle.states'))).toBe(true);

    expect(messages.some((message) => message.includes('events.exclude field "unknownField"'))).toBe(true);

    expect(
      messages.some((message) =>
        message.includes('Capability "capDup" references unknown lifecycle transition "missingTransition"'),
      ),
    ).toBe(true);
    expect(
      messages.some((message) =>
        message.includes('Capability "start" references transition "start" but entity has no lifecycle defined'),
      ),
    ).toBe(true);
    expect(messages.some((message) => message.includes('Duplicate capability key: "capDup"'))).toBe(true);
    expect(messages.some((message) => message.includes('Capability key "amount" conflicts with a field key'))).toBe(
      true,
    );
    expect(
      messages.some((message) =>
        message.includes('Capability key "createdAt" conflicts with a reserved base entity field key'),
      ),
    ).toBe(true);
    expect(messages.some((message) => message.includes('Duplicate input key: "assignee"'))).toBe(true);
    expect(
      messages.some((message) =>
        message.includes('Input "assignee" of type "select" must have a non-empty options array'),
      ),
    ).toBe(true);
    expect(
      messages.some((message) => message.includes('Input "assignee" of type "entity" must specify an "entity" key')),
    ).toBe(true);

    expect(
      messages.some((message) =>
        message.includes('fieldPolicies key "missingField" does not reference a declared field key'),
      ),
    ).toBe(true);
    expect(
      messages.some((message) =>
        message.includes('fieldPolicies key "createdAt" conflicts with a reserved base entity field key'),
      ),
    ).toBe(true);
  });

  it('returns no errors for coherent entity declarations', () => {
    const validEntity: EntityDefinition = {
      key: 'invoice',
      name: 'Invoice',
      pluralName: 'Invoices',
      fields: [
        { key: 'status', type: 'enum', name: 'Status', enumValues: ['draft', 'approved'] },
        { key: 'amount', type: 'number', name: 'Amount' },
      ],
      relations: [{ key: 'owner_id', relation: 'belongs_to', entity: 'user' }],
      computed: [
        {
          key: 'line_count',
          name: 'Line Count',
          type: 'number',
          formulaType: 'aggregation',
          relation: 'owner_id',
          operation: 'count',
        },
      ],
      lifecycle: {
        field: 'status',
        initial: 'draft',
        states: ['draft', 'approved'],
        transitions: [{ key: 'approve', from: 'draft', to: 'approved' }],
      },
      events: { exclude: ['amount'] },
      capabilities: [
        { key: 'approve', type: 'transition', transition: 'approve' },
        { key: 'export_csv', type: 'export', format: 'csv' },
      ],
      fieldPolicies: {
        status: { view: { scope: 'role' } },
      },
    };

    expect(validateEntityRules(makeManifest([validEntity]))).toEqual([]);
  });
});
