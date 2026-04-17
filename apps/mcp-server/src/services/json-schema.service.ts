import { Injectable } from '@nestjs/common';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { CellManifestV1Schema, EntityDefinitionSchema } from '@ikary/cell-contract';
import * as CellPresentation from '@ikary/cell-presentation';
import type { ZodType } from 'zod';
import { RegistryService } from './registry.service';
import type { CustomPrimitiveEntry } from './registry.service';

/**
 * Converts a kebab-case primitive key to the PascalCase prefix used in
 * cell-presentation schema exports.
 *
 *   'data-grid'   → 'DataGrid'
 *   'pagination'  → 'Pagination'
 *   'form'        → 'Form'  (resolved via SCHEMA_NAME_OVERRIDES below)
 */
function keyToPascalCase(key: string): string {
  return key.replace(/(^|-)([a-z])/g, (_, __, c: string) => c.toUpperCase());
}

/** Handles the few primitives whose export names don't match the convention. */
const SCHEMA_NAME_OVERRIDES: Record<string, string> = {
  'form': 'IkaryFormPresentationSchema',
};

/** Returns the Zod schema for a core primitive, or null if not registered. */
function getPresentationZodSchema(key: string): ZodType | null {
  const name = SCHEMA_NAME_OVERRIDES[key] ?? `${keyToPascalCase(key)}PresentationSchema`;
  const schema = (CellPresentation as Record<string, unknown>)[name];
  // Duck-type check for a Zod schema (has _def)
  if (schema && typeof (schema as Record<string, unknown>)['_def'] !== 'undefined') {
    return schema as ZodType;
  }
  return null;
}

@Injectable()
export class JsonSchemaService {
  /** Lazy-generated, memoised — generation runs once per process */
  private readonly cache = new Map<string, object>();

  constructor(private readonly registry: RegistryService) {}

  getManifestSchema(): object {
    return this.memo('manifest', () =>
      zodToJsonSchema(CellManifestV1Schema, {
        $refStrategy: 'none',
        target: 'jsonSchema7',
      }),
    );
  }

  getEntitySchema(): object {
    return this.memo('entity', () =>
      zodToJsonSchema(EntityDefinitionSchema, {
        $refStrategy: 'none',
        target: 'jsonSchema7',
      }),
    );
  }

  getPrimitiveSchema(key: string): object {
    return this.memo(`primitive:${key}`, () => this.buildPrimitiveSchema(key));
  }

  listSchemas(): Array<{ id: string; title: string; url: string }> {
    return [
      { id: 'manifest', title: 'CellManifestV1',    url: '/api/json-schema/manifest' },
      { id: 'entity',   title: 'EntityDefinition',  url: '/api/json-schema/entity' },
    ];
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private memo(key: string, factory: () => object): object {
    if (!this.cache.has(key)) this.cache.set(key, factory());
    return this.cache.get(key)!;
  }

  private buildPrimitiveSchema(key: string): object {
    const entry = this.registry.getPrimitiveContract(key);

    if (!('error' in entry)) {
      const custom = entry as CustomPrimitiveEntry;
      if ('contract' in custom && custom.contract?.props) {
        // Custom primitive with a typed contract — convert props to JSON Schema
        return this.buildFromCustomContract(key, custom);
      }
    }

    // Core primitive — derive JSON Schema from cell-presentation's Zod schema
    const zodSchema = getPresentationZodSchema(key);
    if (zodSchema) {
      return zodToJsonSchema(zodSchema, {
        $refStrategy: 'none',
        target: 'jsonSchema7',
      });
    }

    // Fallback: permissive schema (no contract defined)
    return { $schema: 'http://json-schema.org/draft-07/schema#', type: 'object' };
  }

  private buildFromCustomContract(key: string, custom: CustomPrimitiveEntry): object {
    const props = custom.contract?.props as Record<string, {
      type: string;
      description?: string;
      required?: boolean;
      default?: unknown;
      enum?: string[];
      items?: unknown;
    }> | undefined;

    if (!props || Object.keys(props).length === 0) {
      return { $schema: 'http://json-schema.org/draft-07/schema#', type: 'object' };
    }

    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    for (const [propKey, prop] of Object.entries(props)) {
      const jsonProp: Record<string, unknown> = {};

      switch (prop.type) {
        case 'string':  jsonProp.type = 'string';  break;
        case 'number':  jsonProp.type = 'number';  break;
        case 'boolean': jsonProp.type = 'boolean'; break;
        case 'array':
          jsonProp.type = 'array';
          if (prop.items) jsonProp.items = prop.items;
          break;
        case 'object':  jsonProp.type = 'object';  break;
        default:
          jsonProp.type = 'string'; // 'function' | 'ReactNode' → placeholder
      }

      if (prop.description) jsonProp.description = prop.description;
      if (prop.default !== undefined) jsonProp.default = prop.default;
      if (prop.enum?.length) jsonProp.enum = prop.enum;

      properties[propKey] = jsonProp;
      if (prop.required) required.push(propKey);
    }

    return {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: key,
      type: 'object',
      properties,
      ...(required.length ? { required } : {}),
    };
  }
}
