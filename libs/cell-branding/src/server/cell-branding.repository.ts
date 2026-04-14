import { Inject, Injectable } from '@nestjs/common';
import type { KyselyDatabaseProvider, Queryable } from '@ikary/system-db-core';
import { CELL_BRANDING_DATABASE } from './cell-branding.tokens.js';
import type { CellBrandingDatabaseSchema } from './db/schema.js';

export interface CellBrandingRow {
  cell_id: string;
  accent_color: string | null;
  title_font_family: string | null;
  body_font_family: string | null;
  default_theme_mode: 'light' | 'dark' | null;
  version: number;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface CellBrandingWriteInput {
  accentColor?: string | null;
  titleFontFamily?: string | null;
  bodyFontFamily?: string | null;
  defaultThemeMode?: 'light' | 'dark' | null;
}

@Injectable()
export class CellBrandingRepository {
  constructor(
    @Inject(CELL_BRANDING_DATABASE)
    private readonly database: KyselyDatabaseProvider<CellBrandingDatabaseSchema>,
  ) {}

  private executor(tx?: Queryable<CellBrandingDatabaseSchema>) {
    return tx ?? this.database.db;
  }

  async findByCellId(
    cellId: string,
    tx?: Queryable<CellBrandingDatabaseSchema>,
  ): Promise<CellBrandingRow | null> {
    const row = await this.executor(tx)
      .selectFrom('cell_branding')
      .selectAll()
      .where('cell_id', '=', cellId)
      .executeTakeFirst();
    return row ?? null;
  }

  async insert(
    cellId: string,
    input: CellBrandingWriteInput,
    tx?: Queryable<CellBrandingDatabaseSchema>,
  ): Promise<CellBrandingRow> {
    return this.executor(tx)
      .insertInto('cell_branding')
      .values({
        cell_id: cellId,
        accent_color: input.accentColor ?? null,
        title_font_family: input.titleFontFamily ?? null,
        body_font_family: input.bodyFontFamily ?? null,
        default_theme_mode: input.defaultThemeMode ?? null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async update(
    cellId: string,
    expectedVersion: number,
    patch: CellBrandingWriteInput,
    tx?: Queryable<CellBrandingDatabaseSchema>,
  ): Promise<CellBrandingRow | null> {
    const current = await this.findByCellId(cellId, tx);
    if (!current) return null;

    const set: Record<string, string | Date | number | null> = {
      version: expectedVersion + 1,
      updated_at: new Date(),
    };
    if (patch.accentColor !== undefined) set['accent_color'] = patch.accentColor;
    if (patch.titleFontFamily !== undefined) set['title_font_family'] = patch.titleFontFamily;
    if (patch.bodyFontFamily !== undefined) set['body_font_family'] = patch.bodyFontFamily;
    if (patch.defaultThemeMode !== undefined) set['default_theme_mode'] = patch.defaultThemeMode;

    const row = await this.executor(tx)
      .updateTable('cell_branding')
      .set(set)
      .where('cell_id', '=', cellId)
      .where('version', '=', expectedVersion)
      .returningAll()
      .executeTakeFirst();
    return row ?? null;
  }

  async reset(
    cellId: string,
    expectedVersion: number,
    tx?: Queryable<CellBrandingDatabaseSchema>,
  ): Promise<CellBrandingRow | null> {
    const row = await this.executor(tx)
      .updateTable('cell_branding')
      .set({
        accent_color: null,
        title_font_family: null,
        body_font_family: null,
        default_theme_mode: null,
        version: expectedVersion + 1,
        updated_at: new Date(),
      })
      .where('cell_id', '=', cellId)
      .where('version', '=', expectedVersion)
      .returningAll()
      .executeTakeFirst();
    return row ?? null;
  }
}
