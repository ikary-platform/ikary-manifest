import type {
  CellManifestV1,
  EntityDefinition,
  FieldDefinition,
  FieldRuleDefinition,
  FieldType,
  PageDefinition,
} from '@ikary/cell-contract-core';

export type EntityWrapMode =
  | 'simple-entity'
  | 'nested-entity'
  | 'entity-belongs-to'
  | 'entity-has-many'
  | 'entity-many-to-many'
  | 'entity-polymorphic'
  | 'entity-all-relations'
  | 'computed-expression'
  | 'computed-aggregation'
  | 'computed-conditional'
  | 'computed-all'
  | 'lifecycle-simple'
  | 'lifecycle-guards'
  | 'lifecycle-hooks'
  | 'lifecycle-full'
  | 'events-entity'
  | 'events-lifecycle'
  | 'events-full'
  | 'capabilities-simple'
  | 'capabilities-inputs'
  | 'capabilities-full'
  | 'policies-basic'
  | 'policies-conditional'
  | 'policies-field'
  | 'policies-roles'
  | 'form'
  | 'validation'
  | 'list'
  | 'detail';

function inferFieldType(rules: FieldRuleDefinition[]): FieldType {
  for (const r of rules) {
    if (r.type === 'number_min' || r.type === 'number_max') return 'number';
    if (r.type === 'date' || r.type === 'future_date') return 'date';
    // enum rule type stays as 'string' — no enumValues available in flat rule format
  }
  return 'string';
}

export function wrapValidationRules(parsed: unknown): CellManifestV1 {
  const rules = parsed as FieldRuleDefinition[];

  // Group rules by field key, preserving insertion order
  const fieldMap = new Map<string, FieldRuleDefinition[]>();
  for (const rule of rules) {
    const existing = fieldMap.get(rule.field) ?? [];
    existing.push(rule);
    fieldMap.set(rule.field, existing);
  }

  const fields: FieldDefinition[] = Array.from(fieldMap.entries()).map(([fieldKey, fieldRules], i) => ({
    key: fieldKey,
    type: inferFieldType(fieldRules),
    name: fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1),
    list: { visible: true },
    create: { visible: true, order: i },
    validation: { fieldRules },
  }));

  const entity: EntityDefinition = {
    key: 'entity',
    name: 'Entity',
    pluralName: 'Entities',
    fields,
  };

  return wrapEntityForMode(entity, 'validation');
}

export function wrapEntityForMode(parsed: unknown, mode: EntityWrapMode): CellManifestV1 {
  const entity = parsed as EntityDefinition;
  const key = entity.key ?? 'entity';
  const entityListModes: EntityWrapMode[] = [
    'simple-entity',
    'nested-entity',
    'list',
    'entity-belongs-to',
    'entity-has-many',
    'entity-many-to-many',
    'entity-polymorphic',
    'entity-all-relations',
    'computed-expression',
    'computed-aggregation',
    'computed-conditional',
    'computed-all',
    'lifecycle-simple',
    'lifecycle-guards',
    'lifecycle-hooks',
    'lifecycle-full',
    'events-entity',
    'events-lifecycle',
    'events-full',
    'capabilities-simple',
    'capabilities-inputs',
    'capabilities-full',
    'policies-basic',
    'policies-conditional',
    'policies-field',
    'policies-roles',
  ];
  const landingPage = entityListModes.includes(mode)
    ? `${key}-list`
    : mode === 'detail'
      ? `${key}-detail`
      : `${key}-create`;

  const manifest: CellManifestV1 = {
    apiVersion: 'ikary.io/v1alpha1',
    kind: 'Cell',
    metadata: {
      key: `${key}-preview`,
      name: entity.name ?? 'Entity Preview',
      version: '1.0.0',
    },
    spec: {
      mount: {
        title: entity.pluralName ?? entity.name ?? 'Entity Preview',
        mountPath: `/${key}`,
        landingPage,
      },
      entities: [entity],
      pages: [
        { key: `${key}-list`, type: 'entity-list', title: entity.pluralName ?? 'List', path: `/${key}`, entity: key },
        {
          key: `${key}-create`,
          type: 'entity-create',
          title: `New ${entity.name ?? 'Item'}`,
          path: `/${key}/new`,
          entity: key,
        },
        {
          key: `${key}-detail`,
          type: 'entity-detail',
          title: `${entity.name ?? 'Item'} Detail`,
          path: `/${key}/:id`,
          entity: key,
        },
      ],
      navigation: {
        items: [
          {
            type: 'group',
            key: 'main',
            label: 'Main',
            order: 0,
            children: [
              {
                type: 'page',
                key: `nav-${key}-list`,
                pageKey: `${key}-list`,
                label: entity.pluralName ?? 'List',
                order: 0,
              },
            ],
          },
        ],
      },
    },
  };

  if (mode === 'policies-roles') {
    return {
      ...manifest,
      spec: {
        ...manifest.spec,
        roles: [
          {
            key: 'accountant',
            name: 'Accountant',
            scopes: ['invoice.view', 'invoice.create', 'invoice.update'],
            identityMappings: ['FinanceTeam'],
          },
          {
            key: 'manager',
            name: 'Manager',
            scopes: ['invoice.view', 'invoice.approve'],
            identityMappings: ['FinanceManagers'],
          },
          { key: 'admin', name: 'Admin', description: 'Full access administrator', scopes: ['system.admin'] },
        ],
      },
    };
  }

  return manifest;
}

export function wrapPage(parsed: unknown): CellManifestV1 {
  const page = parsed as PageDefinition;
  const key = page.key ?? 'page';
  const pageTitle = page.title ?? 'Page Preview';

  return {
    apiVersion: 'ikary.io/v1alpha1',
    kind: 'Cell',
    metadata: {
      key: `${key}-preview`,
      name: pageTitle,
      version: '1.0.0',
    },
    spec: {
      mount: {
        title: pageTitle,
        mountPath: `/${key}`,
        landingPage: key,
      },
      entities: [],
      pages: [
        {
          ...page,
          menu: page.menu ?? {
            label: pageTitle,
            order: 0,
          },
        },
      ],
      navigation: {
        items: [
          {
            type: 'group',
            key: 'main',
            label: 'Main',
            order: 0,
            children: [
              {
                type: 'page',
                key: `nav-${key}`,
                pageKey: key,
                label: pageTitle,
                order: 0,
              },
            ],
          },
        ],
      },
    },
  };
}
