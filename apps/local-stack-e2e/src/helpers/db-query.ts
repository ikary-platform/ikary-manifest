import pg from 'pg';

const E2E_DB_URL =
  process.env['TEST_DATABASE_URL'] ?? 'postgres://ikary:ikary@localhost:5433/ikary_test';

/** Minimal shape of a DomainEventEnvelope as returned from the JSONB column. */
export interface OutboxPayload {
  event_id: string;
  event_name: string;
  version: number;
  timestamp: string;
  tenant_id: string;
  workspace_id: string;
  cell_id: string;
  actor: { type: string; id: string };
  entity: { type: string; id: string };
  data: Record<string, unknown>;
  previous: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface OutboxRow {
  id: string;
  created_at: Date;
  processed_at: Date | null;
  failed_at: Date | null;
  retry_count: number;
  event_name: string;
  tenant_id: string | null;
  workspace_id: string | null;
  cell_id: string | null;
  payload: OutboxPayload;
}

async function withPool<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const pool = new pg.Pool({ connectionString: E2E_DB_URL, max: 1 });
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
    await pool.end();
  }
}

/** Fetch all unprocessed outbox rows, newest first, optionally filtered by event_name. */
export async function queryOutbox(filter?: {
  event_name?: string;
  cell_id?: string;
  entity_id?: string;
}): Promise<OutboxRow[]> {
  return withPool(async (client) => {
    const conditions: string[] = [];
    const values: string[] = [];

    if (filter?.event_name) {
      values.push(filter.event_name);
      conditions.push(`event_name = $${values.length}`);
    }
    if (filter?.cell_id) {
      values.push(filter.cell_id);
      conditions.push(`cell_id = $${values.length}`);
    }
    if (filter?.entity_id) {
      values.push(filter.entity_id);
      conditions.push(`payload->'entity'->>'id' = $${values.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await client.query<OutboxRow>(
      `SELECT * FROM domain_event_outbox ${where} ORDER BY created_at ASC`,
      values,
    );
    return result.rows;
  });
}

/** Count outbox rows matching an optional filter. */
export async function countOutbox(filter?: Parameters<typeof queryOutbox>[0]): Promise<number> {
  return (await queryOutbox(filter)).length;
}
