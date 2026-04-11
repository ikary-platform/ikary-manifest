import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required to run migrations.');
}

const pool = new Pool({ connectionString: DATABASE_URL });

async function main(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const migrationsRoot = join(process.cwd(), 'migrations');
  const versions = readdirSync(migrationsRoot).sort();

  for (const version of versions) {
    const versionDir = join(migrationsRoot, version);
    const files = readdirSync(versionDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const migrationId = `${version}/${file}`;
      const existing = await pool.query<{ version: string }>(
        'SELECT version FROM schema_migrations WHERE version = $1',
        [migrationId],
      );

      if (existing.rowCount && existing.rowCount > 0) {
        continue;
      }

      const sql = readFileSync(join(versionDir, file), 'utf8');
      await pool.query(sql);
      await pool.query('INSERT INTO schema_migrations (version) VALUES ($1)', [migrationId]);
      // eslint-disable-next-line no-console
      console.log(`Applied migration: ${migrationId}`);
    }
  }
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
