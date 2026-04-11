import { DatabaseService } from '../kysely/database.service.js';
import { databaseConnectionOptionsSchema } from '../config/database.schema.js';

const TEST_DB_URL =
  process.env['TEST_DATABASE_URL'] ?? 'postgres://ikary:ikary@localhost:5433/ikary_test';

export function createTestDb<DB extends object = Record<string, never>>(): DatabaseService<DB> {
  return new DatabaseService<DB>(
    databaseConnectionOptionsSchema.parse({ connectionString: TEST_DB_URL }),
  );
}
