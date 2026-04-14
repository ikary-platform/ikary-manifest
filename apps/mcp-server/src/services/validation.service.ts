import { Injectable } from '@nestjs/common';
import {
  validateManifest,
  EntityDefinitionSchema,
  PageDefinitionSchema,
  validateSingleEntitySemantics,
} from '@ikary/cell-contract';
import type { ValidationError } from '@ikary/cell-contract';
import { z } from 'zod';
import { compileCellApp, isValidationResult } from '@ikary/cell-engine';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import * as yaml from 'yaml';
import { IkaryPrimitivesConfigSchema, PrimitiveContractSchema } from '@ikary/cell-primitive-contract';

export interface ValidationResult {
  valid: boolean;
  errors: Array<{ field: string; message: string }>;
}

export interface NormalizeResult {
  valid: boolean;
  manifest?: unknown;
  errors: Array<{ field: string; message: string }>;
}

@Injectable()
export class ValidationService {
  validateManifest(manifest: unknown): ValidationResult {
    try {
      const result = validateManifest(manifest);
      return {
        valid: result.valid,
        errors: result.errors.map(mapError),
      };
    } catch (err) {
      return { valid: false, errors: [{ field: 'root', message: String(err) }] };
    }
  }

  validateEntity(entity: unknown): ValidationResult {
    try {
      const parseResult = EntityDefinitionSchema.safeParse(entity);
      if (!parseResult.success) {
        return {
          valid: false,
          errors: parseResult.error.issues.map((issue: z.ZodIssue) => ({
            field: issue.path.join('.') || 'root',
            message: issue.message,
          })),
        };
      }

      const semanticErrors = validateSingleEntitySemantics(parseResult.data);
      return {
        valid: semanticErrors.length === 0,
        errors: semanticErrors.map(mapError),
      };
    } catch (err) {
      return { valid: false, errors: [{ field: 'root', message: String(err) }] };
    }
  }

  validatePage(page: unknown): ValidationResult {
    try {
      const parseResult = PageDefinitionSchema.safeParse(page);
      if (!parseResult.success) {
        return {
          valid: false,
          errors: parseResult.error.issues.map((issue: z.ZodIssue) => ({
            field: issue.path.join('.') || 'root',
            message: issue.message,
          })),
        };
      }

      const pageDef = parseResult.data;
      if (!pageDef.slotBindings?.length) {
        return { valid: true, errors: [] };
      }

      // Validate slot bindings against registered custom primitives
      const errors: Array<{ field: string; message: string }> = [];
      const cwd = process.cwd();
      const configPath = join(cwd, 'ikary-primitives.yaml');
      const registeredSlots = loadPrimitiveSlots(configPath);

      for (let i = 0; i < pageDef.slotBindings.length; i++) {
        const binding = pageDef.slotBindings[i];
        const field = `slotBindings[${i}]`;

        // Check that primitive is registered (custom primitives only; core primitives are not in ikary-primitives.yaml)
        if (existsSync(configPath) && !registeredSlots.has(binding.primitive)) {
          errors.push({
            field: `${field}.primitive`,
            message: `Primitive "${binding.primitive}" is not registered in ikary-primitives.yaml. Use list_primitives to see available primitives, or omit validation for core primitives.`,
          });
          continue;
        }

        // If registered, check that the slot name exists on the primitive
        const slotInfo = registeredSlots.get(binding.primitive);
        if (slotInfo) {
          const rawSlot = binding.slot;
          let zoneName = rawSlot;
          if (rawSlot.endsWith('.before')) zoneName = rawSlot.slice(0, -7);
          else if (rawSlot.endsWith('.after')) zoneName = rawSlot.slice(0, -6);

          if (slotInfo.slots.length > 0 && !slotInfo.slots.some((s) => s.name === zoneName)) {
            errors.push({
              field: `${field}.slot`,
              message: `Zone "${zoneName}" is not declared in primitive "${binding.primitive}". Declared slots: ${slotInfo.slots.map((s) => s.name).join(', ')}.`,
            });
          }

          // Check allowedModes
          const effectiveMode = binding.mode ?? (rawSlot.endsWith('.before') ? 'prepend' : rawSlot.endsWith('.after') ? 'append' : 'replace');
          const slot = slotInfo.slots.find((s) => s.name === zoneName);
          if (slot && !slot.allowedModes.includes(effectiveMode)) {
            errors.push({
              field: `${field}.mode`,
              message: `Mode "${effectiveMode}" is not allowed for slot "${zoneName}" in primitive "${binding.primitive}". Allowed: ${slot.allowedModes.join(', ')}.`,
            });
          }
        }
      }

      return { valid: errors.length === 0, errors };
    } catch (err) {
      return { valid: false, errors: [{ field: 'root', message: String(err) }] };
    }
  }

  validateSlotBindings(
    slotBindings: unknown[],
    pageType?: string,
  ): ValidationResult {
    try {
      const PAGE_SLOT_ZONES: Record<string, string[]> = {
        'entity-list': ['header', 'toolbar', 'table', 'footer'],
        'entity-detail': ['header', 'navigation', 'content', 'footer'],
        'dashboard': ['header', 'content', 'footer'],
        'custom': ['content'],
        'entity-create': [],
        'entity-edit': [],
      };

      const errors: Array<{ field: string; message: string }> = [];
      const cwd = process.cwd();
      const configPath = join(cwd, 'ikary-primitives.yaml');
      const registeredSlots = loadPrimitiveSlots(configPath);
      const validZones = pageType ? (PAGE_SLOT_ZONES[pageType] ?? []) : null;

      for (let i = 0; i < slotBindings.length; i++) {
        const binding = slotBindings[i] as Record<string, unknown>;
        const field = `slotBindings[${i}]`;

        if (typeof binding.primitive !== 'string' || !binding.primitive) {
          errors.push({ field: `${field}.primitive`, message: 'primitive must be a non-empty string' });
          continue;
        }
        if (typeof binding.slot !== 'string' || !binding.slot) {
          errors.push({ field: `${field}.slot`, message: 'slot must be a non-empty string' });
          continue;
        }

        const rawSlot = binding.slot as string;
        let zoneName = rawSlot;
        if (rawSlot.endsWith('.before')) zoneName = rawSlot.slice(0, -7);
        else if (rawSlot.endsWith('.after')) zoneName = rawSlot.slice(0, -6);

        if (validZones && validZones.length > 0 && !validZones.includes(zoneName)) {
          errors.push({
            field: `${field}.slot`,
            message: `Zone "${zoneName}" is not a valid slot for page type "${pageType}". Valid zones: ${validZones.join(', ')}.`,
          });
        }

        if (existsSync(configPath)) {
          const slotInfo = registeredSlots.get(binding.primitive as string);
          if (!slotInfo) {
            errors.push({
              field: `${field}.primitive`,
              message: `Primitive "${binding.primitive}" not found in ikary-primitives.yaml.`,
            });
          }
        }
      }

      return { valid: errors.length === 0, errors };
    } catch (err) {
      return { valid: false, errors: [{ field: 'root', message: String(err) }] };
    }
  }

  normalizeManifest(manifest: unknown): NormalizeResult {
    try {
      const result = compileCellApp(manifest as any);
      if (isValidationResult(result)) {
        return {
          valid: false,
          errors: result.errors.map(mapError),
        };
      }
      return { valid: true, manifest: result, errors: [] };
    } catch (err) {
      return { valid: false, errors: [{ field: 'root', message: String(err) }] };
    }
  }
}

function mapError(err: ValidationError): { field: string; message: string } {
  return { field: err.field, message: err.message };
}

interface PrimitiveSlotInfo {
  slots: Array<{ name: string; allowedModes: Array<'replace' | 'prepend' | 'append'> }>;
}

function loadPrimitiveSlots(configPath: string): Map<string, PrimitiveSlotInfo> {
  const result = new Map<string, PrimitiveSlotInfo>();
  if (!existsSync(configPath)) return result;

  try {
    const raw = readFileSync(configPath, 'utf-8');
    const config = IkaryPrimitivesConfigSchema.safeParse(yaml.parse(raw));
    if (!config.success) return result;

    const configDir = dirname(configPath);
    for (const entry of config.data.primitives) {
      const contractPath = resolve(configDir, entry.contract);
      if (!existsSync(contractPath)) {
        result.set(entry.key, { slots: [] });
        continue;
      }
      try {
        const contractRaw = readFileSync(contractPath, 'utf-8');
        const contractResult = PrimitiveContractSchema.safeParse(yaml.parse(contractRaw));
        if (contractResult.success) {
          result.set(entry.key, { slots: contractResult.data.slots ?? [] });
        } else {
          result.set(entry.key, { slots: [] });
        }
      } catch {
        result.set(entry.key, { slots: [] });
      }
    }
  } catch {
    // ignore
  }

  return result;
}
