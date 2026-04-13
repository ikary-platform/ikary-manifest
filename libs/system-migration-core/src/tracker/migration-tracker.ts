import { sql } from '@ikary/system-db-core';
import type { DatabaseService } from '@ikary/system-db-core';

export const SCHEMA_VERSIONS_TABLE = 'ikary_schema_versions';

export class MigrationTracker {
  constructor(private readonly dbService: DatabaseService) {}

  async bootstrap(): Promise<void> {
    await sql`
      CREATE TABLE IF NOT EXISTS ikary_schema_versions (
        package_name VARCHAR NOT NULL,
        version VARCHAR NOT NULL,
        applied_at TIMESTAMP NOT NULL DEFAULT NOW(),
        PRIMARY KEY (package_name, version)
      )
    `.execute(this.dbService.db);
  }

  async getApplied(packageName: string): Promise<Set<string>> {
    const rows = await (this.dbService.db as any)
      .selectFrom(SCHEMA_VERSIONS_TABLE)
      .select(['version'])
      .where('package_name', '=', packageName)
      .execute();
    return new Set((rows as Array<{ version: string }>).map((r) => r.version));
  }

  async record(packageName: string, version: string): Promise<void> {
    const appliedAt = new Date();
    await (this.dbService.db as any)
      .insertInto(SCHEMA_VERSIONS_TABLE)
      .values({ package_name: packageName, version, applied_at: appliedAt })
      .execute();
  }

  async deleteVersion(packageName: string, version: string): Promise<void> {
    await (this.dbService.db as any)
      .deleteFrom(SCHEMA_VERSIONS_TABLE)
      .where('package_name', '=', packageName)
      .where('version', '=', version)
      .execute();
  }
}
