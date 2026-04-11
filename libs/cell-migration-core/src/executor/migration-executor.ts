import { readFileSync } from 'node:fs';
import { sql } from '@ikary/system-db-core';
import type { DatabaseService } from '@ikary/system-db-core';
import { SCHEMA_VERSIONS_TABLE } from '../tracker/migration-tracker.js';
import type { MigrationVersion } from '../shared/migration-version.schema.js';

/**
 * Split SQL text into individual statements, respecting PostgreSQL
 * dollar-quoted strings (`$$ ... $$` or `$tag$ ... $tag$`).
 */
export function splitStatements(text: string): string[] {
  const results: string[] = [];
  let current = '';
  let i = 0;
  while (i < text.length) {
    if (text[i] === '$') {
      // Try to match a dollar-quote tag: $tag$ or $$
      const tagMatch = text.slice(i).match(/^(\$[a-zA-Z0-9_]*\$)/);
      if (tagMatch) {
        const tag = tagMatch[1]!;
        const endIdx = text.indexOf(tag, i + tag.length);
        if (endIdx !== -1) {
          current += text.slice(i, endIdx + tag.length);
          i = endIdx + tag.length;
          continue;
        }
      }
      current += text[i];
      i++;
    } else if (text[i] === ';') {
      const trimmed = current.trim();
      if (trimmed.length > 0) results.push(trimmed);
      current = '';
      i++;
    } else {
      current += text[i];
      i++;
    }
  }
  const trimmed = current.trim();
  if (trimmed.length > 0) results.push(trimmed);
  return results;
}

export class MigrationExecutor {
  constructor(private readonly dbService: DatabaseService) {}

  async execute(versions: MigrationVersion[], dryRun = false): Promise<{ applied: number }> {
    let applied = 0;

    for (const version of versions) {
      if (dryRun) {
        applied++;
        continue;
      }

      await this.dbService.withTransaction(async (trx) => {
        for (const file of version.files) {
          const sqlText = readFileSync(file.absolutePath, 'utf8');
          const stripped = sqlText.replace(/--.*$/gm, '');
          const statements = splitStatements(stripped);
          for (const statement of statements) {
            await sql.raw(statement).execute(trx as any);
          }
        }
        const appliedAt = new Date();
        await (trx as any)
          .insertInto(SCHEMA_VERSIONS_TABLE)
          .values({
            package_name: version.packageName,
            version: version.version,
            applied_at: appliedAt,
          })
          .onConflict((oc: any) =>
            oc.columns(['package_name', 'version']).doUpdateSet({ applied_at: appliedAt }),
          )
          .execute();
      });

      applied++;
    }

    return { applied };
  }
}
