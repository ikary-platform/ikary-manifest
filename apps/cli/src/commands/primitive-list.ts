import { join, resolve, dirname } from 'node:path';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import yaml from 'yaml';
import * as fmt from '../output/format.js';
import { theme } from '../output/theme.js';
import { IkaryPrimitivesConfigSchema, PrimitiveContractSchema } from '@ikary/primitive-contract';

interface ListEntry {
  key: string;
  version: string;
  category: string;
  description: string;
  source: 'core' | 'custom';
}

// Core primitives mirrored from mcp-server/src/data/primitive-catalog.ts
const CORE_PRIMITIVES: ListEntry[] = [
  { key: 'data-grid', version: 'core', category: 'collection', description: 'Sortable, filterable tabular data grid with pagination', source: 'core' },
  { key: 'card-list', version: 'core', category: 'collection', description: 'Card-based collection layout for visual data', source: 'core' },
  { key: 'pagination', version: 'core', category: 'collection', description: 'Page navigation controls for collections', source: 'core' },
  { key: 'filter-bar', version: 'core', category: 'collection', description: 'Filter controls for collection views', source: 'core' },
  { key: 'bulk-command-bar', version: 'core', category: 'collection', description: 'Batch action toolbar for selected items', source: 'core' },
  { key: 'input', version: 'core', category: 'input', description: 'Text input field', source: 'core' },
  { key: 'textarea', version: 'core', category: 'input', description: 'Multi-line text input', source: 'core' },
  { key: 'select', version: 'core', category: 'input', description: 'Dropdown select field', source: 'core' },
  { key: 'checkbox', version: 'core', category: 'input', description: 'Boolean checkbox input', source: 'core' },
  { key: 'radio-group', version: 'core', category: 'input', description: 'Radio button group for single selection', source: 'core' },
  { key: 'toggle', version: 'core', category: 'input', description: 'Toggle switch for boolean values', source: 'core' },
  { key: 'date-input', version: 'core', category: 'input', description: 'Date picker input', source: 'core' },
  { key: 'relation-field', version: 'core', category: 'input', description: 'Related entity selector', source: 'core' },
  { key: 'form', version: 'core', category: 'form', description: 'Complete form with sections, validation, and submit actions', source: 'core' },
  { key: 'form-field', version: 'core', category: 'form', description: 'Individual form field wrapper with label and validation', source: 'core' },
  { key: 'form-section', version: 'core', category: 'form', description: 'Grouped section within a form', source: 'core' },
  { key: 'page-header', version: 'core', category: 'layout', description: 'Page header with title, breadcrumbs, and actions', source: 'core' },
  { key: 'tabs', version: 'core', category: 'layout', description: 'Tabbed content container', source: 'core' },
  { key: 'detail-section', version: 'core', category: 'layout', description: 'Grouped section in a detail view', source: 'core' },
  { key: 'detail-item', version: 'core', category: 'layout', description: 'Single label-value pair in a detail view', source: 'core' },
  { key: 'list-page', version: 'core', category: 'page', description: 'Full list page with header, filters, grid, and pagination', source: 'core' },
  { key: 'detail-page', version: 'core', category: 'page', description: 'Full detail page with header, tabs, and sections', source: 'core' },
  { key: 'dashboard-page', version: 'core', category: 'page', description: 'Dashboard layout with metric cards and widgets', source: 'core' },
  { key: 'entity-header', version: 'core', category: 'page', description: 'Entity record header with title, status, and actions', source: 'core' },
  { key: 'field-value', version: 'core', category: 'display', description: 'Formatted field value renderer (handles all field types)', source: 'core' },
  { key: 'metric-card', version: 'core', category: 'display', description: 'KPI metric card with value, trend, and delta', source: 'core' },
  { key: 'activity-feed', version: 'core', category: 'display', description: 'Chronological activity/event feed', source: 'core' },
  { key: 'empty-state', version: 'core', category: 'feedback', description: 'Empty state placeholder with title and action', source: 'core' },
  { key: 'loading-state', version: 'core', category: 'feedback', description: 'Loading skeleton or spinner', source: 'core' },
  { key: 'error-state', version: 'core', category: 'feedback', description: 'Error display with message and retry action', source: 'core' },
];

async function loadCustomPrimitives(cwd: string): Promise<ListEntry[]> {
  const configPath = join(cwd, 'ikary-primitives.yaml');
  if (!existsSync(configPath)) return [];

  try {
    const raw = await readFile(configPath, 'utf-8');
    const parsed = yaml.parse(raw);
    const result = IkaryPrimitivesConfigSchema.safeParse(parsed);
    if (!result.success) return [];

    const configDir = dirname(configPath);
    const entries: ListEntry[] = [];

    for (const entry of result.data.primitives) {
      let category = 'custom';
      let description = '';

      // Try to read category/description from contract
      const contractPath = resolve(configDir, entry.contract);
      if (existsSync(contractPath)) {
        try {
          const contractRaw = await readFile(contractPath, 'utf-8');
          const contractParsed = yaml.parse(contractRaw);
          const contractResult = PrimitiveContractSchema.safeParse(contractParsed);
          if (contractResult.success) {
            category = contractResult.data.category;
            description = contractResult.data.description ?? '';
          }
        } catch {
          // ignore
        }
      }

      entries.push({
        key: entry.key,
        version: entry.version,
        category,
        description,
        source: 'custom',
      });
    }

    return entries;
  } catch {
    return [];
  }
}

export async function primitiveListCommand(options: { json?: boolean }): Promise<void> {
  const cwd = process.cwd();
  const customPrimitives = await loadCustomPrimitives(cwd);
  const all = [...CORE_PRIMITIVES, ...customPrimitives];

  if (options.json) {
    console.log(JSON.stringify(all, null, 2));
    return;
  }

  fmt.section('Primitives');
  fmt.newline();

  // Group by source, then by category
  const core = all.filter((p) => p.source === 'core');
  const custom = all.filter((p) => p.source === 'custom');

  const categories = [...new Set(core.map((p) => p.category))];

  fmt.body(`${theme.accent('Core')} (${core.length})`);
  fmt.newline();

  for (const cat of categories) {
    const group = core.filter((p) => p.category === cat);
    fmt.body(`  ${theme.muted(cat)}`);
    for (const p of group) {
      fmt.body(`    ${p.key.padEnd(22)} ${theme.muted(p.description)}`);
    }
  }

  if (custom.length > 0) {
    fmt.newline();
    fmt.body(`${theme.accent('Custom')} (${custom.length})`);
    fmt.newline();
    for (const p of custom) {
      const overrideNote = CORE_PRIMITIVES.some((c) => c.key === p.key)
        ? theme.muted(' (overrides core)')
        : '';
      fmt.body(`  ${p.key.padEnd(22)} ${theme.accent(`v${p.version}`)}  ${theme.muted(p.category)}  ${theme.muted(p.description)}${overrideNote}`);
    }
  } else {
    fmt.newline();
    fmt.muted(`No custom primitives. Run ${theme.accent('ikary primitive add <name>')} to create one.`);
  }

  fmt.newline();
  fmt.muted(`Total: ${all.length} primitives`);
  fmt.newline();
}
