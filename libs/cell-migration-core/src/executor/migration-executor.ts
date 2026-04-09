import { readFileSync } from 'node:fs';
import { sql } from '@ikary/system-db-core';
import type { DatabaseService } from '@ikary/system-db-core';
import { SCHEMA_VERSIONS_TABLE } from '../tracker/migration-tracker.js';
import type { MigrationVersion } from '../shared/migration-version.schema.js';

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
          const statements = sqlText
            .split(';')
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
          for (const statement of statements) {
            await sql.raw(statement).execute(trx as any);
          }
        }
        /* v8 ignore next */
        const appliedAt = this.dbService.isSqlite ? new Date().toISOString() : new Date();
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
