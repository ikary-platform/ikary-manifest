import { Inject, Injectable } from '@nestjs/common';
import type { Queryable } from '@ikary/system-db-core';
import { DatabaseService } from '../database/database.service';
import type { AuthorizationDatabaseSchema } from '../database/schema';

export interface RegistryRecord {
  id: string;
  code: string;
  description: string | null;
  created_at: Date;
}

@Injectable()
export class RegistryRepository {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  private executor(client?: Queryable<AuthorizationDatabaseSchema>) {
    return client ?? this.db.db;
  }

  async upsertFeature(
    input: { code: string; description?: string },
    client?: Queryable<AuthorizationDatabaseSchema>,
  ): Promise<RegistryRecord> {
    return this.executor(client)
      .insertInto('features')
      .values({
        code: input.code,
        description: input.description ?? null,
      })
      /* v8 ignore next 4 — Kysely onConflict callback; covered by integration tests */
      .onConflict((oc) =>
        oc.column('code').doUpdateSet(({ ref }) => ({
          description: input.description ?? ref('features.description'),
        })),
      )
      .returning(['id', 'code', 'description', 'created_at'])
      .executeTakeFirstOrThrow();
  }

  async upsertDomain(
    input: { code: string; description?: string },
    client?: Queryable<AuthorizationDatabaseSchema>,
  ): Promise<RegistryRecord> {
    return this.executor(client)
      .insertInto('domains')
      .values({
        code: input.code,
        description: input.description ?? null,
      })
      /* v8 ignore next 4 — Kysely onConflict callback; covered by integration tests */
      .onConflict((oc) =>
        oc.column('code').doUpdateSet(({ ref }) => ({
          description: input.description ?? ref('domains.description'),
        })),
      )
      .returning(['id', 'code', 'description', 'created_at'])
      .executeTakeFirstOrThrow();
  }

  async featureExists(code: string, client?: Queryable<AuthorizationDatabaseSchema>): Promise<boolean> {
    const row = await this.executor(client)
      .selectFrom('features')
      .select('code')
      .where('code', '=', code)
      .executeTakeFirst();
    return Boolean(row);
  }

  async domainExists(code: string, client?: Queryable<AuthorizationDatabaseSchema>): Promise<boolean> {
    const row = await this.executor(client)
      .selectFrom('domains')
      .select('code')
      .where('code', '=', code)
      .executeTakeFirst();
    return Boolean(row);
  }

  listFeatures(client?: Queryable<AuthorizationDatabaseSchema>): Promise<RegistryRecord[]> {
    return this.executor(client)
      .selectFrom('features')
      .select(['id', 'code', 'description', 'created_at'])
      .orderBy('code', 'asc')
      .execute();
  }

  listDomains(client?: Queryable<AuthorizationDatabaseSchema>): Promise<RegistryRecord[]> {
    return this.executor(client)
      .selectFrom('domains')
      .select(['id', 'code', 'description', 'created_at'])
      .orderBy('code', 'asc')
      .execute();
  }
}
