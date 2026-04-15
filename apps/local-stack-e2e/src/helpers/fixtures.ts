import { writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const API_BASE = 'http://localhost:4511';
export const PREVIEW_BASE = 'http://localhost:4510';

/** Manifest JSON for E2E tests — item entity with name (string) + count (number). */
const TEST_MANIFEST_JSON = JSON.stringify({
  apiVersion: 'ikary.co/v1alpha1',
  kind: 'Cell',
  metadata: {
    key: 'e2e_local',
    name: 'E2E Local',
    version: '1.0.0',
  },
  spec: {
    mount: { mountPath: '/', landingPage: 'dashboard' },
    entities: [
      {
        key: 'item',
        name: 'Item',
        pluralName: 'Items',
        fields: [
          { key: 'name', type: 'string', name: 'Name' },
          { key: 'count', type: 'number', name: 'Count' },
        ],
      },
    ],
    pages: [
      { key: 'dashboard', type: 'dashboard', title: 'Dashboard', path: '/dashboard' },
    ],
  },
});

/**
 * Multi-entity manifest for CRUD integration tests.
 * Three entities: account (string fields), contact (string + enum), deal (string + number).
 */
const MULTI_ENTITY_MANIFEST_JSON = JSON.stringify({
  apiVersion: 'ikary.co/v1alpha1',
  kind: 'Cell',
  metadata: {
    key: 'e2e_multi',
    name: 'E2E Multi-Entity',
    version: '1.0.0',
  },
  spec: {
    mount: { mountPath: '/', landingPage: 'dashboard' },
    entities: [
      {
        key: 'account',
        name: 'Account',
        pluralName: 'Accounts',
        fields: [
          { key: 'name', type: 'string', name: 'Name' },
          { key: 'industry', type: 'string', name: 'Industry' },
          { key: 'website', type: 'string', name: 'Website' },
        ],
      },
      {
        key: 'contact',
        name: 'Contact',
        pluralName: 'Contacts',
        fields: [
          { key: 'first_name', type: 'string', name: 'First Name' },
          { key: 'last_name', type: 'string', name: 'Last Name' },
          { key: 'email', type: 'string', name: 'Email' },
          { key: 'status', type: 'enum', name: 'Status', enumValues: ['active', 'inactive'] },
        ],
      },
      {
        key: 'deal',
        name: 'Deal',
        pluralName: 'Deals',
        fields: [
          { key: 'title', type: 'string', name: 'Title' },
          { key: 'amount', type: 'number', name: 'Amount' },
          { key: 'stage', type: 'enum', name: 'Stage', enumValues: ['prospecting', 'negotiation', 'closed_won', 'closed_lost'] },
        ],
      },
    ],
    pages: [
      { key: 'dashboard', type: 'dashboard', title: 'Dashboard', path: '/dashboard' },
    ],
  },
});

/** Write the test manifest to a temp file and return the path. */
export function writeTestManifest(): string {
  const path = join(tmpdir(), `ikary-e2e-manifest-${process.pid}.json`);
  writeFileSync(path, TEST_MANIFEST_JSON, 'utf8');
  return path;
}

/** Write the multi-entity manifest to a temp file and return the path. */
export function writeMultiEntityManifest(): string {
  const path = join(tmpdir(), `ikary-e2e-multi-manifest-${process.pid}.json`);
  writeFileSync(path, MULTI_ENTITY_MANIFEST_JSON, 'utf8');
  return path;
}

/**
 * Lifecycle manifest for outbox, transition, and capability E2E tests.
 *
 * Entity: article
 *  - status field drives a lifecycle state machine
 *  - body field is excluded from domain events
 *  - custom event names: article.created / article.updated / article.deleted
 *  - transitions: draft → published (publish), published → archived (archive)
 *  - capabilities: transition, mutation, workflow, export, integration
 */
const LIFECYCLE_MANIFEST_JSON = JSON.stringify({
  apiVersion: 'ikary.co/v1alpha1',
  kind: 'Cell',
  metadata: {
    key: 'e2e_lifecycle',
    name: 'E2E Lifecycle',
    version: '1.0.0',
  },
  spec: {
    mount: { mountPath: '/', landingPage: 'dashboard' },
    entities: [
      {
        key: 'article',
        name: 'Article',
        pluralName: 'Articles',
        fields: [
          { key: 'title', type: 'string', name: 'Title' },
          { key: 'body', type: 'string', name: 'Body' },
          { key: 'status', type: 'string', name: 'Status' },
          { key: 'featured', type: 'boolean', name: 'Featured' },
        ],
        events: {
          names: {
            created: 'article.created',
            updated: 'article.updated',
            deleted: 'article.deleted',
          },
          exclude: ['body'],
        },
        lifecycle: {
          field: 'status',
          initial: 'draft',
          states: ['draft', 'published', 'archived'],
          transitions: [
            {
              key: 'publish',
              from: 'draft',
              to: 'published',
              label: 'Publish',
              event: 'article.published',
              hooks: ['notify_subscribers'],
            },
            {
              key: 'archive',
              from: 'published',
              to: 'archived',
              label: 'Archive',
              event: 'article.archived',
            },
          ],
        },
        capabilities: [
          { key: 'publish_article', type: 'transition', transition: 'publish' },
          { key: 'feature_article', type: 'mutation', updates: { featured: true } },
          { key: 'send_newsletter', type: 'workflow', workflow: 'newsletter_workflow' },
          { key: 'export_pdf', type: 'export', format: 'pdf' },
          { key: 'notify_crm', type: 'integration', provider: 'crm_provider' },
        ],
      },
    ],
    pages: [
      { key: 'dashboard', type: 'dashboard', title: 'Dashboard', path: '/dashboard' },
    ],
  },
});

/** Write the lifecycle manifest to a temp file and return the path. */
export function writeLifecycleManifest(): string {
  const path = join(tmpdir(), `ikary-e2e-lifecycle-manifest-${process.pid}.json`);
  writeFileSync(path, LIFECYCLE_MANIFEST_JSON, 'utf8');
  return path;
}

/** Delete the temp manifest file if it exists. */
export function deleteTestManifest(path: string): void {
  if (existsSync(path)) unlinkSync(path);
}

/** Merge auth header into existing headers for E2E requests. */
export function withAuth(token: string | null, headers?: Record<string, string>): Record<string, string> {
  return {
    ...(headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
