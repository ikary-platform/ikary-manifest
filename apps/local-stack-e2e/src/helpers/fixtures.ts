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
