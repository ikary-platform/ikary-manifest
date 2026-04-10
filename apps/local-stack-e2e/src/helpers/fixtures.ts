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

/** Write the test manifest to a temp file and return the path. */
export function writeTestManifest(): string {
  const path = join(tmpdir(), `ikary-e2e-manifest-${process.pid}.json`);
  writeFileSync(path, TEST_MANIFEST_JSON, 'utf8');
  return path;
}

/** Delete the temp manifest file if it exists. */
export function deleteTestManifest(path: string): void {
  if (existsSync(path)) unlinkSync(path);
}
