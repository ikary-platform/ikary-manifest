import { describe, expect, it } from 'vitest';

import * as RootExports from './index';
import * as ContractEntityExports from './contract/entity';
import * as ContractEntityPolicyExports from './contract/entity/policy';
import * as ContractManifestExports from './contract/manifest';
import * as ContractManifestCapabilityExports from './contract/manifest/capability';
import * as ContractManifestDomainEventExports from './contract/manifest/domain-event';
import * as ContractManifestLifecycleExports from './contract/manifest/lifecycle';
import * as SemanticExports from './semantic';
import * as SemanticFieldRules from './semantic/field-rules.zod';
import * as SemanticIssue from './semantic/issue.zod';
import * as SharedZodExports from './shared/zod';
import './semantic/types';
import './shared/types';

import { AppShellDefinitionSchema } from './contract/manifest/shell/AppShellDefinitionSchema';
import { CapabilityInputDefinitionSchema } from './contract/manifest/capability/CapabilityInputDefinitionSchema';
import { CapabilityInputTypeSchema } from './contract/manifest/capability/CapabilityInputTypeSchema';
import { CellManifestV1Schema } from './contract/manifest/CellManifestV1Schema';
import { CellMountDefinitionSchema } from './contract/manifest/shell/CellMountDefinitionSchema';
import { CellSpecSchema } from './contract/manifest/CellSpecSchema';
import { NavigationDefinitionSchema } from './contract/manifest/navigation/NavigationDefinitionSchema';
import { NavigationItemSchema } from './contract/manifest/navigation/NavigationItemSchema';
import { PageDefinitionSchema } from './contract/manifest/page/PageDefinitionSchema';
import { LifecycleTransitionDefinitionSchema } from './contract/manifest/lifecycle/LifecycleTransitionDefinitionSchema';
import { DomainEventActorTypeSchema } from './contract/manifest/domain-event/DomainEventActorTypeSchema';
import { DomainEventActorSchema } from './contract/manifest/domain-event/DomainEventActorSchema';
import { DomainEventEntityRefSchema } from './contract/manifest/domain-event/DomainEventEntityRefSchema';
import { DomainEventEnvelopeSchema } from './contract/manifest/domain-event/DomainEventEnvelopeSchema';

import { EntityDefinitionSchema } from './contract/entity/EntityDefinitionSchema';
import { EntityValidationSchema } from './contract/entity/EntityValidationSchema';
import { DisplayDefinitionSchema } from './contract/entity/display/DisplayDefinitionSchema';
import { LifecycleDefinitionSchema } from './contract/entity/lifecycle/LifecycleDefinitionSchema';
import { FieldDefinitionSchema } from './contract/entity/field/FieldDefinitionSchema';
import { ComputedFieldDefinitionSchema } from './contract/entity/field/ComputedFieldDefinitionSchema';
import { FieldRuleDefinitionSchema } from './contract/entity/field/FieldRuleDefinitionSchema';
import { FieldRuleTypeSchema } from './contract/entity/field/FieldRuleTypeSchema';
import { FieldValidationSchema } from './contract/entity/field/FieldValidationSchema';
import { CrossEntityValidatorRefSchema } from './contract/entity/CrossEntityValidatorRefSchema';
import { EntityRuleDefinitionSchema } from './contract/entity/EntityRuleDefinitionSchema';
import { RelationDefinitionSchema } from './contract/entity/relation/RelationDefinitionSchema';
import { ActionPolicySchema } from './contract/entity/policy/ActionPolicySchema';
import { EntityPoliciesDefinitionSchema } from './contract/entity/policy/EntityPoliciesDefinitionSchema';
import { FieldPoliciesDefinitionSchema } from './contract/entity/policy/FieldPoliciesDefinitionSchema';
import { PolicyScopeSchema } from './contract/entity/policy/PolicyScopeSchema';
import { RoleDefinitionSchema } from './contract/manifest/role/RoleDefinitionSchema';

import { ValidationScopeSchema } from './semantic/ValidationScopeSchema';
import { ValidationIssueSchema } from './semantic/ValidationIssueSchema';
import { ValidationErrorResponseSchema } from './semantic/ValidationErrorResponseSchema';
import { ValidationSeveritySchema } from './shared/ValidationSeveritySchema';

import { CELL_SCHEMA_CATALOG } from './schema-catalog';
import { CELL_SCHEMA_MODULE_GRAPH } from './schema-module-graph';
import { BASE_ENTITY_FIELDS, BASE_ENTITY_FIELD_KEYS } from './shared/base-entity';

describe('public surfaces', () => {
  it('loads package entrypoints and compat re-exports', () => {
    expect(RootExports.CellManifestV1Schema).toBeDefined();
    expect(RootExports.CELL_SCHEMA_CATALOG).toBeDefined();
    expect(RootExports.CELL_SCHEMA_MODULE_GRAPH).toBeDefined();

    expect(ContractEntityExports.EntityDefinitionSchema).toBeDefined();
    expect(ContractEntityPolicyExports.ActionPolicySchema).toBeDefined();
    expect(ContractManifestExports.PageDefinitionSchema).toBeDefined();
    expect(ContractManifestCapabilityExports.CapabilityInputTypeSchema).toBeDefined();
    expect(ContractManifestDomainEventExports.DomainEventEnvelopeSchema).toBeDefined();
    expect(ContractManifestLifecycleExports.LifecycleTransitionDefinitionSchema).toBeDefined();

    expect(SemanticExports.validateManifest).toBeDefined();
    expect(SemanticFieldRules.FieldRuleTypeSchema).toBeDefined();
    expect(SemanticIssue.ValidationIssueSchema).toBeDefined();
    expect(SharedZodExports.EntityDefinitionSchema).toBeDefined();
    expect(SharedZodExports.CellManifestV1Schema).toBeDefined();
  });

  it('exposes schema catalog and module graph as non-empty registries', () => {
    expect(CELL_SCHEMA_CATALOG.length).toBeGreaterThan(0);
    expect(CELL_SCHEMA_CATALOG.some((entry) => entry.name === 'CellManifestV1Schema')).toBe(true);
    expect(CELL_SCHEMA_MODULE_GRAPH.nodes.length).toBeGreaterThan(0);
    expect(CELL_SCHEMA_MODULE_GRAPH.importEdges.length).toBeGreaterThan(0);
  });

  it('exposes canonical base entity fields and reserved key set', () => {
    expect(BASE_ENTITY_FIELDS.length).toBeGreaterThan(0);
    expect(BASE_ENTITY_FIELD_KEYS.has('id')).toBe(true);
  });
});

describe('manifest schema contracts', () => {
  it('validates capability input types and input definitions', () => {
    expect(CapabilityInputTypeSchema.safeParse('string').success).toBe(true);

    expect(
      CapabilityInputDefinitionSchema.safeParse({
        key: 'title',
        type: 'string',
        defaultValue: 'Draft',
      }).success,
    ).toBe(true);

    expect(
      CapabilityInputDefinitionSchema.safeParse({
        key: 'state',
        type: 'select',
        options: ['open', 'closed'],
        defaultValue: 'archived',
      }).success,
    ).toBe(false);
  });

  it('validates domain event schemas', () => {
    expect(DomainEventActorTypeSchema.safeParse('user').success).toBe(true);
    expect(DomainEventActorSchema.safeParse({ type: 'api', id: 'actor-1' }).success).toBe(true);
    expect(DomainEventEntityRefSchema.safeParse({ type: 'invoice', id: 'inv-1' }).success).toBe(true);

    expect(
      DomainEventEnvelopeSchema.safeParse({
        event_id: 'evt_1',
        event_name: 'invoice.created',
        version: 1,
        timestamp: new Date().toISOString(),
        tenant_id: 'tenant_1',
        workspace_id: 'workspace_1',
        cell_id: 'cell_1',
        actor: { type: 'user', id: 'user_1' },
        entity: { type: 'invoice', id: 'inv_1' },
        data: { amount: 100 },
        previous: {},
        metadata: { traceId: 'trace_1' },
      }).success,
    ).toBe(true);
  });

  it('validates CellMountDefinitionSchema branches', () => {
    expect(
      CellMountDefinitionSchema.safeParse({
        mountPath: '/',
        landingPage: 'dashboard',
      }).success,
    ).toBe(true);

    expect(
      CellMountDefinitionSchema.safeParse({
        mountPath: 'dashboard',
        landingPage: 'dashboard',
      }).success,
    ).toBe(false);
  });

  it('validates PageDefinitionSchema branches', () => {
    expect(
      PageDefinitionSchema.safeParse({
        key: 'dashboard',
        type: 'dashboard',
        title: 'Dashboard',
        path: '/dashboard',
      }).success,
    ).toBe(true);

    expect(
      PageDefinitionSchema.safeParse({
        key: 'invalid-path',
        type: 'dashboard',
        title: 'Invalid Path',
        path: 'dashboard',
      }).success,
    ).toBe(false);

    expect(
      PageDefinitionSchema.safeParse({
        key: 'list',
        type: 'entity-list',
        title: 'List',
        path: '/list',
      }).success,
    ).toBe(false);

    expect(
      PageDefinitionSchema.safeParse({
        key: 'dashboard-with-entity',
        type: 'dashboard',
        title: 'Dashboard',
        path: '/dashboard',
        entity: 'invoice',
      }).success,
    ).toBe(false);

    expect(
      PageDefinitionSchema.safeParse({
        key: 'menu-bad',
        type: 'custom',
        title: 'Menu Bad',
        path: '/menu-bad',
        menu: {},
      }).success,
    ).toBe(false);
  });

  it('validates navigation item/definition recursion and duplicate guards', () => {
    expect(
      NavigationItemSchema.safeParse({
        type: 'group',
        key: 'root',
        label: 'Root',
        children: [{ type: 'page', key: 'dashboard', pageKey: 'dashboard' }],
      }).success,
    ).toBe(true);

    expect(
      NavigationDefinitionSchema.safeParse({
        items: [
          { type: 'page', key: 'dashboard', pageKey: 'dashboard' },
          { type: 'page', key: 'dashboard', pageKey: 'dashboard-2' },
        ],
      }).success,
    ).toBe(false);

    expect(
      NavigationDefinitionSchema.safeParse({
        items: [
          { type: 'page', key: 'dashboard', pageKey: 'dashboard' },
          { type: 'page', key: 'secondary-dashboard', pageKey: 'dashboard' },
        ],
      }).success,
    ).toBe(false);

    expect(
      NavigationDefinitionSchema.safeParse({
        items: [
          {
            type: 'group',
            key: 'root',
            label: 'Root',
            children: [{ type: 'page', key: 'dashboard', pageKey: 'dashboard' }],
          },
        ],
      }).success,
    ).toBe(true);
  });

  it('validates lifecycle transition and lifecycle schema branches', () => {
    expect(
      LifecycleTransitionDefinitionSchema.safeParse({
        key: 'approve',
        from: 'draft',
        to: 'approved',
        guards: ['is_owner'],
        hooks: ['notify'],
      }).success,
    ).toBe(true);

    expect(
      LifecycleTransitionDefinitionSchema.safeParse({
        key: 'approve',
        from: 'draft',
        to: 'approved',
        guards: ['is_owner', 'is_owner'],
        hooks: ['notify', 'notify'],
      }).success,
    ).toBe(false);

    expect(
      LifecycleDefinitionSchema.safeParse({
        field: 'status',
        initial: 'draft',
        states: ['draft', 'approved'],
        transitions: [{ key: 'approve', from: 'draft', to: 'approved' }],
      }).success,
    ).toBe(true);

    expect(
      LifecycleDefinitionSchema.safeParse({
        field: 'status',
        initial: 'missing',
        states: ['draft', 'approved', 'draft'],
        transitions: [
          { key: 'approve', from: 'draft', to: 'approved' },
          { key: 'approve', from: 'ghost', to: 'void' },
          { key: 'approve2', from: 'draft', to: 'approved' },
        ],
      }).success,
    ).toBe(false);
  });

  it('validates AppShellDefinitionSchema branches', () => {
    const validShell = {
      key: 'main-shell',
      name: 'Main Shell',
      layout: { mode: 'sidebar-content' as const, maxContentWidth: 'full' as const },
      branding: { productName: 'Core' },
      regions: [
        { key: 'main' as const, enabled: true },
        { key: 'sidebar' as const, enabled: true, width: 280, minWidth: 220, maxWidth: 360 },
      ],
      navigation: {
        primary: [
          {
            key: 'home',
            label: 'Home',
            children: [{ key: 'invoices', label: 'Invoices', href: '/invoices' }],
          },
        ],
        secondary: [{ key: 'settings', label: 'Settings', href: '/settings' }],
      },
      capabilities: { commandPalette: true, notifications: true },
      responsive: { mobileBreakpoint: 768, overlaySidebarOnMobile: true },
      outlet: { type: 'page' as const, region: 'main' as const },
    };

    expect(AppShellDefinitionSchema.safeParse(validShell).success).toBe(true);

    expect(
      AppShellDefinitionSchema.safeParse({
        ...validShell,
        regions: [{ key: 'sidebar', enabled: true }],
      }).success,
    ).toBe(false);

    expect(
      AppShellDefinitionSchema.safeParse({
        ...validShell,
        regions: [{ key: 'main', enabled: false }],
      }).success,
    ).toBe(false);

    expect(
      AppShellDefinitionSchema.safeParse({
        ...validShell,
        regions: [
          { key: 'main', enabled: true },
          { key: 'sidebar', enabled: true },
          { key: 'sidebar', enabled: true },
        ],
      }).success,
    ).toBe(false);
  });

  it('validates CellSpecSchema and CellManifestV1Schema branches', () => {
    const validSpec = {
      mount: { mountPath: '/', landingPage: 'dashboard' },
      entities: [
        {
          key: 'invoice',
          name: 'Invoice',
          pluralName: 'Invoices',
          fields: [{ key: 'number', type: 'string', name: 'Number' }],
        },
      ],
      pages: [{ key: 'dashboard', type: 'dashboard', title: 'Dashboard', path: '/dashboard' }],
      roles: [{ key: 'admin', name: 'Admin', scopes: ['invoice.manage'] }],
    };

    expect(CellSpecSchema.safeParse(validSpec).success).toBe(true);
    expect(
      CellManifestV1Schema.safeParse({
        apiVersion: 'ikary.co/v1alpha1',
        kind: 'Cell',
        metadata: { key: 'core', name: 'Core', version: '1.0.0' },
        spec: validSpec,
      }).success,
    ).toBe(true);

    expect(
      CellSpecSchema.safeParse({
        mount: { mountPath: '/', landingPage: 'dashboard' },
      }).success,
    ).toBe(false);

    expect(
      CellSpecSchema.safeParse({
        ...validSpec,
        entities: [
          { key: 'invoice', name: 'Invoice', pluralName: 'Invoices', fields: [] },
          { key: 'invoice', name: 'Invoice 2', pluralName: 'Invoices 2', fields: [] },
        ],
      }).success,
    ).toBe(false);

    expect(
      CellSpecSchema.safeParse({
        ...validSpec,
        pages: [
          { key: 'dashboard', type: 'dashboard', title: 'Dashboard', path: '/dashboard' },
          { key: 'dashboard', type: 'custom', title: 'Another', path: '/another' },
        ],
      }).success,
    ).toBe(false);

    expect(
      CellSpecSchema.safeParse({
        ...validSpec,
        roles: [
          { key: 'admin', name: 'Admin', scopes: ['invoice.manage'] },
          { key: 'admin', name: 'Admin 2', scopes: ['invoice.view'] },
        ],
      }).success,
    ).toBe(false);
  });
});

describe('entity schema contracts', () => {
  it('validates rule/policy helper schemas', () => {
    expect(FieldRuleTypeSchema.safeParse('required').success).toBe(true);

    expect(
      FieldRuleDefinitionSchema.safeParse({
        ruleId: 'invoice.number.required',
        type: 'required',
        field: 'number',
        messageKey: 'field.required',
        clientSafe: true,
        blocking: true,
        severity: 'error',
      }).success,
    ).toBe(true);

    expect(
      FieldValidationSchema.safeParse({
        fieldRules: [
          {
            ruleId: 'invoice.number.required',
            type: 'required',
            field: 'number',
            messageKey: 'field.required',
            clientSafe: true,
            blocking: true,
            severity: 'error',
          },
        ],
      }).success,
    ).toBe(true);

    expect(
      EntityRuleDefinitionSchema.safeParse({
        ruleId: 'invoice.state.invariant',
        type: 'entity_invariant',
        paths: ['status', 'approvedAt'],
        messageKey: 'entity.invariant',
        clientSafe: true,
        blocking: true,
        severity: 'warning',
      }).success,
    ).toBe(true);

    expect(
      CrossEntityValidatorRefSchema.safeParse({
        ruleId: 'invoice.cross.customer',
        type: 'cross_entity',
        validatorRef: 'invoice.customer.exists',
        messageKey: 'cross.entity',
        clientSafe: false,
        async: true,
        blocking: true,
        severity: 'error',
      }).success,
    ).toBe(true);

    expect(
      EntityValidationSchema.safeParse({
        entityRules: [
          {
            ruleId: 'invoice.state.invariant',
            type: 'entity_invariant',
            paths: ['status'],
            messageKey: 'entity.invariant',
            clientSafe: true,
            blocking: true,
            severity: 'error',
          },
        ],
      }).success,
    ).toBe(true);

    expect(
      EntityValidationSchema.safeParse({
        serverValidators: [
          {
            ruleId: 'invoice.cross.customer',
            type: 'cross_entity',
            validatorRef: 'invoice.customer.exists',
            messageKey: 'cross.entity',
            clientSafe: false,
            async: true,
            blocking: true,
            severity: 'error',
          },
        ],
      }).success,
    ).toBe(true);

    expect(EntityValidationSchema.safeParse({}).success).toBe(false);

    expect(PolicyScopeSchema.safeParse('role').success).toBe(true);
    expect(ActionPolicySchema.safeParse({ scope: 'role', condition: 'user.isAdmin' }).success).toBe(true);
    expect(
      EntityPoliciesDefinitionSchema.safeParse({
        view: { scope: 'tenant' },
        create: { scope: 'role' },
      }).success,
    ).toBe(true);
    expect(EntityPoliciesDefinitionSchema.safeParse({}).success).toBe(true);

    expect(
      FieldPoliciesDefinitionSchema.safeParse({
        number: { view: { scope: 'role' } },
      }).success,
    ).toBe(true);
    expect(
      FieldPoliciesDefinitionSchema.safeParse({
        number: {},
      }).success,
    ).toBe(false);

    expect(
      RoleDefinitionSchema.safeParse({
        key: 'admin',
        name: 'Admin',
        scopes: ['scope.a', 'scope.b'],
        identityMappings: ['iam.admin', 'iam.admin'],
      }).success,
    ).toBe(false);
  });

  it('validates field/relation/computed/entity definitions', () => {
    expect(
      RelationDefinitionSchema.safeParse({
        key: 'customer_id',
        relation: 'belongs_to',
        entity: 'customer',
      }).success,
    ).toBe(true);

    expect(
      FieldDefinitionSchema.safeParse({
        key: 'meta',
        type: 'object',
        name: 'Meta',
        list: { visible: true, sortable: false, searchable: true, filterable: true },
        form: { visible: true, placeholder: 'Enter meta' },
        create: { visible: true, order: 1, placeholder: 'Create meta' },
        edit: { visible: true, order: 2, placeholder: 'Edit meta' },
        display: { type: 'text', truncate: true, align: 'left' },
        validation: {
          fieldRules: [
            {
              ruleId: 'meta.required',
              type: 'required',
              field: 'meta',
              messageKey: 'field.required',
              clientSafe: true,
              blocking: true,
              severity: 'error',
            },
          ],
        },
        fields: [{ key: 'child', type: 'string', name: 'Child' }],
      }).success,
    ).toBe(true);

    expect(
      ComputedFieldDefinitionSchema.safeParse({
        key: 'statusLabel',
        name: 'Status Label',
        type: 'string',
        formulaType: 'expression',
        expression: 'status',
        dependencies: ['status', 'status'],
      }).success,
    ).toBe(false);

    expect(
      ComputedFieldDefinitionSchema.safeParse({
        key: 'status_label_ok',
        name: 'Status Label Ok',
        type: 'string',
        formulaType: 'expression',
        expression: 'status',
        dependencies: ['status', 'category'],
      }).success,
    ).toBe(true);

    expect(
      ComputedFieldDefinitionSchema.safeParse({
        key: 'lineCount',
        name: 'Line Count',
        type: 'string',
        formulaType: 'aggregation',
        relation: 'lines',
        operation: 'count',
      }).success,
    ).toBe(false);

    expect(
      ComputedFieldDefinitionSchema.safeParse({
        key: 'sumAmount',
        name: 'Sum Amount',
        type: 'number',
        formulaType: 'aggregation',
        relation: 'lines',
        operation: 'sum',
      }).success,
    ).toBe(false);

    expect(
      ComputedFieldDefinitionSchema.safeParse({
        key: 'avgAmount',
        name: 'Avg Amount',
        type: 'string',
        formulaType: 'aggregation',
        relation: 'lines',
        operation: 'avg',
        field: 'amount',
      }).success,
    ).toBe(false);

    expect(
      ComputedFieldDefinitionSchema.safeParse({
        key: 'minState',
        name: 'Min State',
        type: 'boolean',
        formulaType: 'aggregation',
        relation: 'lines',
        operation: 'min',
        field: 'state',
      }).success,
    ).toBe(false);

    expect(
      ComputedFieldDefinitionSchema.safeParse({
        key: 'max_code',
        name: 'Max Code',
        type: 'string',
        formulaType: 'aggregation',
        relation: 'lines',
        operation: 'max',
        field: 'code',
      }).success,
    ).toBe(true);

    expect(
      EntityDefinitionSchema.safeParse({
        key: 'invoice',
        name: 'Invoice',
        pluralName: 'Invoices',
        fields: [{ key: 'number', type: 'string', name: 'Number' }],
      }).success,
    ).toBe(true);
  });

  it('validates display definition branch matrix', () => {
    expect(DisplayDefinitionSchema.safeParse({ type: 'currency', currency: 'EUR', precision: 2 }).success).toBe(true);
    expect(
      DisplayDefinitionSchema.safeParse({
        type: 'entity-link',
        labelField: 'name',
        subtitleField: 'code',
        route: '/entity/:id',
      }).success,
    ).toBe(true);
    expect(DisplayDefinitionSchema.safeParse({ type: 'status', statusMap: { draft: 'Draft' } }).success).toBe(true);
    expect(DisplayDefinitionSchema.safeParse({ type: 'badge', badgeToneMap: { active: 'success' } }).success).toBe(
      true,
    );
    expect(DisplayDefinitionSchema.safeParse({ type: 'tags', maxItems: 3, showOverflowCount: true }).success).toBe(
      true,
    );
    expect(DisplayDefinitionSchema.safeParse({ type: 'custom', rendererKey: 'core.custom' }).success).toBe(true);

    expect(DisplayDefinitionSchema.safeParse({ type: 'text', currency: 'EUR' }).success).toBe(false);
    expect(DisplayDefinitionSchema.safeParse({ type: 'text', precision: 2 }).success).toBe(false);
    expect(DisplayDefinitionSchema.safeParse({ type: 'text', labelField: 'name' }).success).toBe(false);
    expect(DisplayDefinitionSchema.safeParse({ type: 'text', subtitleField: 'name' }).success).toBe(false);
    expect(DisplayDefinitionSchema.safeParse({ type: 'text', route: '/x' }).success).toBe(false);
    expect(DisplayDefinitionSchema.safeParse({ type: 'text', statusMap: { open: 'Open' } }).success).toBe(false);
    expect(DisplayDefinitionSchema.safeParse({ type: 'text', badgeToneMap: { active: 'success' } }).success).toBe(
      false,
    );
    expect(DisplayDefinitionSchema.safeParse({ type: 'text', maxItems: 1 }).success).toBe(false);
    expect(DisplayDefinitionSchema.safeParse({ type: 'text', showOverflowCount: true }).success).toBe(false);
    expect(DisplayDefinitionSchema.safeParse({ type: 'custom' }).success).toBe(false);
    expect(DisplayDefinitionSchema.safeParse({ type: 'text', rendererKey: 'core.custom' }).success).toBe(false);
  });
});

describe('semantic issue schemas', () => {
  it('validates issue and error response schemas', () => {
    expect(ValidationSeveritySchema.safeParse('error').success).toBe(true);
    expect(ValidationScopeSchema.safeParse('entity').success).toBe(true);

    const issue = {
      code: 'entity.invariant',
      scope: 'entity',
      entity: 'invoice',
      ruleId: 'invoice.state.invariant',
      messageKey: 'entity.invariant',
      defaultMessage: 'Invalid invoice state',
      path: 'status',
      paths: ['status', 'approvedAt'],
      severity: 'warning',
      blocking: true,
      retryable: false,
      meta: { source: 'schema' },
    } as const;

    expect(ValidationIssueSchema.safeParse(issue).success).toBe(true);
    expect(
      ValidationErrorResponseSchema.safeParse({
        error: 'VALIDATION_FAILED',
        requestId: 'req-1',
        issues: [issue],
      }).success,
    ).toBe(true);
  });
});
