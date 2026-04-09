import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import * as yaml from 'yaml';
import { PRIMITIVE_CATALOG } from '../data/primitive-catalog';
import type { PrimitiveCatalogEntry } from '../data/primitive-catalog';
import {
  IkaryPrimitivesConfigSchema,
  PrimitiveContractSchema,
  scaffoldPrimitiveFiles,
  toPascalCase,
} from '@ikary/primitive-contract';
import type { PrimitiveContract } from '@ikary/primitive-contract';

export interface ExampleEntry {
  key: string;
  title: string;
  description: string;
  entities: string[];
  format: string;
}

export interface CustomPrimitiveEntry {
  key: string;
  version: string;
  category: string;
  description: string;
  source: 'custom';
  contract?: PrimitiveContract;
  examples?: unknown[];
}

export interface ScaffoldResult {
  createdFiles: string[];
  configUpdated: boolean;
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
  // ── Core catalog ─────────────────────────────────────────────────────────

  listPrimitives(options?: {
    category?: string;
    source?: 'core' | 'custom' | 'all';
  }): Array<PrimitiveCatalogEntry | CustomPrimitiveEntry> {
    const source = options?.source ?? 'all';
    const category = options?.category;

    const core: PrimitiveCatalogEntry[] =
      source === 'custom'
        ? []
        : PRIMITIVE_CATALOG.filter((p) => !category || p.category === category);

    const custom: CustomPrimitiveEntry[] =
      source === 'core'
        ? []
        : this.loadCustomPrimitiveEntries().filter(
            (p) => !category || p.category === category,
          );

    return [...core, ...custom];
  }

  getPrimitiveContract(
    key: string,
  ): (PrimitiveCatalogEntry & { contractSchema?: PrimitiveContract }) | CustomPrimitiveEntry | { error: string } {
    // Check custom primitives first (they may override core)
    const custom = this.loadCustomPrimitiveEntries();
    const customEntry = custom.find((p) => p.key === key);
    if (customEntry) return customEntry;

    const coreEntry = PRIMITIVE_CATALOG.find((p) => p.key === key);
    if (!coreEntry) {
      return {
        error: `Primitive "${key}" not found. Use list_primitives to see available primitives.`,
      };
    }
    return coreEntry;
  }

  getPrimitiveExamples(key: string): unknown[] | { error: string } {
    const cwd = process.cwd();
    const configPath = join(cwd, 'ikary-primitives.yaml');

    if (!existsSync(configPath)) {
      return {
        error: `No ikary-primitives.yaml found. "${key}" may be a core primitive (no examples file).`,
      };
    }

    try {
      const raw = readFileSync(configPath, 'utf-8');
      const config = IkaryPrimitivesConfigSchema.safeParse(yaml.parse(raw));
      if (!config.success) return { error: 'Invalid ikary-primitives.yaml' };

      const entry = config.data.primitives.find((p) => p.key === key);
      if (!entry) {
        return {
          error: `Primitive "${key}" not found in ikary-primitives.yaml. Use list_primitives to see available primitives.`,
        };
      }

      if (!entry.examples) {
        return { error: `No examples file declared for primitive "${key}".` };
      }

      const examplesPath = resolve(dirname(configPath), entry.examples);
      if (!existsSync(examplesPath)) {
        return { error: `Examples file not found: ${entry.examples}` };
      }

      // Examples files are .ts modules — we can only read and return the raw content
      // (dynamic import not possible in this stateless server context)
      const content = readFileSync(examplesPath, 'utf-8');
      return [{ source: entry.examples, content }];
    } catch (err) {
      return { error: `Failed to load examples: ${String(err)}` };
    }
  }

  scaffoldPrimitive(opts: {
    name: string;
    label: string;
    description?: string;
    category?: string;
  }): ScaffoldResult | { error: string } {
    const cwd = process.cwd();
    const primitivesDir = join(cwd, 'primitives', opts.name);
    const configPath = join(cwd, 'ikary-primitives.yaml');

    if (existsSync(primitivesDir)) {
      return { error: `Primitive "${opts.name}" already exists at primitives/${opts.name}` };
    }

    if (!/^[a-z][a-z0-9-]*$/.test(opts.name)) {
      return { error: 'Primitive name must be lowercase letters, numbers, and hyphens' };
    }

    const label = opts.label;
    const description = opts.description ?? `A custom ${label} primitive`;
    const category = opts.category ?? 'custom';

    try {
      const files = scaffoldPrimitiveFiles({ name: opts.name, label, description, category });
      const createdFiles: string[] = [];

      for (const [relativePath, content] of Object.entries(files)) {
        const absPath = resolve(cwd, relativePath);
        mkdirSync(dirname(absPath), { recursive: true });
        writeFileSync(absPath, content, 'utf-8');
        createdFiles.push(relativePath);
      }

      // Update ikary-primitives.yaml
      const PascalName = toPascalCase(opts.name);
      let config: ReturnType<typeof IkaryPrimitivesConfigSchema.parse>;

      if (existsSync(configPath)) {
        const raw = readFileSync(configPath, 'utf-8');
        config = IkaryPrimitivesConfigSchema.parse(yaml.parse(raw));
      } else {
        config = {
          apiVersion: 'ikary.co/v1alpha1',
          kind: 'PrimitiveConfig',
          primitives: [],
        };
      }

      config.primitives.push({
        key: opts.name,
        version: '1.0.0',
        source: `./primitives/${opts.name}/${PascalName}.register.ts`,
        contract: `./primitives/${opts.name}/${opts.name}.contract.yaml`,
        examples: `./primitives/${opts.name}/${PascalName}.example.ts`,
      });

      writeFileSync(configPath, yaml.stringify(config), 'utf-8');

      return { createdFiles, configUpdated: true };
    } catch (err) {
      return { error: `Scaffold failed: ${String(err)}` };
    }
  }

  validatePrimitiveProps(
    key: string,
    props: Record<string, unknown>,
  ): { valid: boolean; errors?: string[] } | { error: string } {
    const cwd = process.cwd();
    const configPath = join(cwd, 'ikary-primitives.yaml');

    if (!existsSync(configPath)) {
      return {
        error: `No ikary-primitives.yaml found. Cannot validate props for "${key}".`,
      };
    }

    try {
      const raw = readFileSync(configPath, 'utf-8');
      const config = IkaryPrimitivesConfigSchema.safeParse(yaml.parse(raw));
      if (!config.success) return { error: 'Invalid ikary-primitives.yaml' };

      const entry = config.data.primitives.find((p) => p.key === key);
      if (!entry) {
        return { error: `Primitive "${key}" not found in ikary-primitives.yaml.` };
      }

      const contractPath = resolve(dirname(configPath), entry.contract);
      if (!existsSync(contractPath)) {
        return { error: `Contract file not found: ${entry.contract}` };
      }

      const contractRaw = readFileSync(contractPath, 'utf-8');
      const contractResult = PrimitiveContractSchema.safeParse(yaml.parse(contractRaw));
      if (!contractResult.success) {
        return { error: `Invalid contract for "${key}": ${contractResult.error.message}` };
      }

      const contract = contractResult.data;
      const errors: string[] = [];

      // Validate required props
      const required = contract.props.required ?? [];
      for (const reqProp of required) {
        if (!(reqProp in props)) {
          errors.push(`Missing required prop: "${reqProp}"`);
        }
      }

      // Validate declared prop types
      for (const [propName, propValue] of Object.entries(props)) {
        const propDef = contract.props.properties[propName];
        if (!propDef) {
          errors.push(`Unknown prop: "${propName}" (not declared in contract)`);
          continue;
        }
        const typeError = checkPropType(propName, propValue, propDef.type);
        if (typeError) errors.push(typeError);
      }

      return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
    } catch (err) {
      return { error: `Validation failed: ${String(err)}` };
    }
  }

  // ── Examples ─────────────────────────────────────────────────────────────

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

      const manifestsDir = path.resolve(__dirname, '../../../../manifests/examples');
      const filePath = path.resolve(manifestsDir, `${entry.key}.yaml`);

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

  // ── Private helpers ───────────────────────────────────────────────────────

  private loadCustomPrimitiveEntries(): CustomPrimitiveEntry[] {
    const configPath = join(process.cwd(), 'ikary-primitives.yaml');
    if (!existsSync(configPath)) return [];

    try {
      const raw = readFileSync(configPath, 'utf-8');
      const config = IkaryPrimitivesConfigSchema.safeParse(yaml.parse(raw));
      if (!config.success) return [];

      const configDir = dirname(configPath);
      return config.data.primitives.map((entry) => {
        let category = 'custom';
        let description = '';
        let contract: PrimitiveContract | undefined;

        const contractPath = resolve(configDir, entry.contract);
        if (existsSync(contractPath)) {
          try {
            const contractRaw = readFileSync(contractPath, 'utf-8');
            const contractResult = PrimitiveContractSchema.safeParse(yaml.parse(contractRaw));
            if (contractResult.success) {
              category = contractResult.data.category;
              description = contractResult.data.description ?? '';
              contract = contractResult.data;
            }
          } catch {
            // ignore
          }
        }

        return {
          key: entry.key,
          version: entry.version,
          category,
          description,
          source: 'custom' as const,
          contract,
        };
      });
    } catch {
      return [];
    }
  }
}

function checkPropType(name: string, value: unknown, expectedType: string): string | null {
  switch (expectedType) {
    case 'string':
      return typeof value !== 'string' ? `Prop "${name}" should be a string, got ${typeof value}` : null;
    case 'number':
      return typeof value !== 'number' ? `Prop "${name}" should be a number, got ${typeof value}` : null;
    case 'boolean':
      return typeof value !== 'boolean' ? `Prop "${name}" should be a boolean, got ${typeof value}` : null;
    case 'array':
      return !Array.isArray(value) ? `Prop "${name}" should be an array` : null;
    case 'object':
      return typeof value !== 'object' || value === null || Array.isArray(value)
        ? `Prop "${name}" should be an object`
        : null;
    default:
      return null; // function, ReactNode, etc. — can't validate at runtime
  }
}
