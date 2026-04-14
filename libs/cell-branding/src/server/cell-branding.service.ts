import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ZodError, type ZodSchema } from 'zod';
import type { CellBranding } from '../shared/cell-branding.schema.js';
import type {
  PatchCellBrandingInput,
  ResetCellBrandingInput,
} from '../shared/cell-branding.requests.js';
import { patchCellBrandingSchema, resetCellBrandingSchema } from '../shared/cell-branding.requests.js';
import { buildDefaultCellBrandingDto, mapCellBrandingRowToDto } from './cell-branding.mapper.js';
import { CellBrandingRepository } from './cell-branding.repository.js';

function parseOrBadRequest<T>(schema: ZodSchema<T>, raw: unknown): T {
  try {
    return schema.parse(raw);
  } catch (err) {
    if (err instanceof ZodError) {
      throw new BadRequestException({
        message: 'Invalid branding input.',
        issues: err.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        })),
      });
    }
    throw err;
  }
}

@Injectable()
export class CellBrandingService {
  constructor(
    @Inject(CellBrandingRepository)
    private readonly repository: CellBrandingRepository,
  ) {}

  async getBranding(cellId: string): Promise<CellBranding> {
    const row = await this.repository.findByCellId(cellId);
    return row ? mapCellBrandingRowToDto(row) : buildDefaultCellBrandingDto(cellId);
  }

  async upsertBranding(cellId: string, rawInput: unknown): Promise<CellBranding> {
    const input: PatchCellBrandingInput = parseOrBadRequest(patchCellBrandingSchema, rawInput);
    const current = await this.repository.findByCellId(cellId);

    if (!current) {
      if (input.expectedVersion !== 0) {
        throw new ConflictException({
          message: 'Version conflict: no branding row exists yet.',
          currentVersion: 0,
          expectedVersion: input.expectedVersion,
        });
      }
      const row = await this.repository.insert(cellId, input);
      return mapCellBrandingRowToDto(row);
    }

    if (current.version !== input.expectedVersion) {
      throw new ConflictException({
        message: 'Version conflict.',
        currentVersion: current.version,
        expectedVersion: input.expectedVersion,
      });
    }

    const updated = await this.repository.update(cellId, current.version, input);
    if (!updated) {
      throw new ConflictException({
        message: 'Branding update raced with another write.',
        currentVersion: current.version,
      });
    }
    return mapCellBrandingRowToDto(updated);
  }

  async resetBranding(cellId: string, rawInput: unknown): Promise<CellBranding> {
    const input: ResetCellBrandingInput = parseOrBadRequest(resetCellBrandingSchema, rawInput);
    const current = await this.repository.findByCellId(cellId);
    if (!current) {
      throw new NotFoundException('No branding row to reset for this cell.');
    }
    if (current.version !== input.expectedVersion) {
      throw new ConflictException({
        message: 'Version conflict.',
        currentVersion: current.version,
        expectedVersion: input.expectedVersion,
      });
    }
    const reset = await this.repository.reset(cellId, current.version);
    if (!reset) {
      throw new ConflictException({
        message: 'Branding reset raced with another write.',
        currentVersion: current.version,
      });
    }
    return mapCellBrandingRowToDto(reset);
  }
}
