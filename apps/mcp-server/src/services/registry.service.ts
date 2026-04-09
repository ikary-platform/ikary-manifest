import { Injectable } from '@nestjs/common';
import { PRIMITIVE_CATALOG } from '../data/primitive-catalog';
import type { PrimitiveCatalogEntry } from '../data/primitive-catalog';

export interface ExampleEntry {
  key: string;
  title: string;
  description: string;
  entities: string[];
  format: string;
}

const EXAMPLES: ExampleEntry[] = [
  {
    key: 'minimal-manifest',
    title: 'Minimal Cell',
    description: 'Simplest possible manifest with a single dashboard page.',
    entities: [],
    format: 'yaml',
  },
  {
    key: 'crm-manifest',
    title: 'CRM Application',
    description: 'Full CRM with customers, invoices, roles, pages, and navigation.',
    entities: ['customer', 'invoice'],
    format: 'yaml',
  },
  {
    key: 'entities/customer.entity',
    title: 'Customer Entity',
    description: 'Customer entity with fields, relations, lifecycle, and capabilities.',
    entities: ['customer'],
    format: 'yaml',
  },
  {
    key: 'entities/invoice.entity',
    title: 'Invoice Entity',
    description: 'Invoice entity with fields and belongs_to relation to customer.',
    entities: ['invoice'],
    format: 'yaml',
  },
];

@Injectable()
export class RegistryService {
  listPrimitives(category?: string): PrimitiveCatalogEntry[] {
    if (category) {
      return PRIMITIVE_CATALOG.filter((p) => p.category === category);
    }
    return PRIMITIVE_CATALOG;
  }

  getPrimitiveContract(key: string): PrimitiveCatalogEntry | { error: string } {
    const entry = PRIMITIVE_CATALOG.find((p) => p.key === key);
    if (!entry) {
      return { error: `Primitive "${key}" not found. Use list_primitives to see available primitives.` };
    }
    return entry;
  }

  listExamples(): ExampleEntry[] {
    return EXAMPLES;
  }

  getExampleManifest(key: string): { example: string; manifest: unknown } | { error: string } {
    const entry = EXAMPLES.find((e) => e.key === key);
    if (!entry) {
      return { error: `Example "${key}" not found. Use list_examples to see available examples.` };
    }

    try {
      const fs = require('fs');
      const path = require('path');

      // Resolve relative to the manifests directory
      const manifestsDir = path.resolve(__dirname, '../../../../manifests/examples');
      const filePath = path.resolve(manifestsDir, `${entry.key}.yaml`);

      // Guard against path traversal: resolved path must stay within manifestsDir
      if (path.relative(manifestsDir, filePath).startsWith('..')) {
        return { error: 'Invalid example key' };
      }

      if (!fs.existsSync(filePath)) {
        return { error: `Example file not found at ${entry.key}.yaml` };
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      return { example: entry.key, manifest: content };
    } catch (err) {
      return { error: `Failed to load example: ${String(err)}` };
    }
  }
}
