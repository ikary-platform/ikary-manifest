import { parse as parseYaml } from 'yaml';
import { parseManifest } from '@ikary/cell-contract';
import type { CellManifestV1 } from '@ikary/cell-contract';

// Inline stripMeta — removes $schema keys and $ref-only entries before Zod strict validation.
// Mirrors libs/cell-loader/src/strip-meta.ts but kept local to avoid bundling Node-only loader code.
function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function stripMeta(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj
      .filter((item) => !(isPlainObject(item) && '$ref' in item && Object.keys(item).length === 1))
      .map(stripMeta);
  }
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (key === '$schema') continue;
    result[key] = stripMeta(value);
  }
  return result;
}

export type ManifestCategory = 'docs' | 'crm' | 'erp' | 'projects' | 'hr';

export interface AppManifestScenario {
  label: string;
  description?: string;
  category: ManifestCategory;
  manifest: CellManifestV1;
}

export const MANIFEST_CATEGORY_LABELS: Record<ManifestCategory, string> = {
  docs: 'Documentation',
  crm: 'CRM',
  erp: 'ERP',
  projects: 'Project Management',
  hr: 'Human Resources',
};

export const MANIFEST_CATEGORY_ORDER: ManifestCategory[] = [
  'docs',
  'crm',
  'erp',
  'projects',
  'hr',
];

// Eagerly load all example YAML files as raw strings at build time.
// Sorted by path so numeric filename prefixes (01-, 02-…) control display order.
const YAML_FILES = import.meta.glob<string>(
  '../../../../manifests/examples/{docs,crm,erp,projects,hr}/*.yaml',
  { query: '?raw', import: 'default', eager: true },
);

export const APP_MANIFEST_SCENARIOS: AppManifestScenario[] = Object.entries(YAML_FILES)
  .sort(([a], [b]) => a.localeCompare(b))
  .flatMap(([filePath, yamlContent]) => {
    const dir = filePath.split('/').at(-2) as ManifestCategory | undefined;
    if (!dir || !MANIFEST_CATEGORY_ORDER.includes(dir)) return [];

    let raw: unknown;
    try {
      raw = parseYaml(yamlContent);
    } catch (err) {
      console.warn('[app-manifest-loader] YAML parse error in', filePath, err);
      return [];
    }

    const result = parseManifest(stripMeta(raw));
    if (!result.valid || !result.manifest) {
      console.warn('[app-manifest-loader] Invalid manifest in', filePath, result.errors);
      return [];
    }

    return [{
      label: result.manifest.metadata.name,
      description: result.manifest.metadata.description,
      category: dir,
      manifest: result.manifest,
    }];
  });
