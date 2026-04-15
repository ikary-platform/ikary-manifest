CREATE TABLE IF NOT EXISTS domain_event_outbox (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  processed_at  TIMESTAMPTZ,
  failed_at     TIMESTAMPTZ,
  retry_count   INTEGER      NOT NULL DEFAULT 0,
  event_name    TEXT         NOT NULL,
  tenant_id     TEXT,
  workspace_id  TEXT,
  cell_id       TEXT,
  payload       JSONB        NOT NULL
);

-- Worker polls unprocessed events in insertion order
CREATE INDEX IF NOT EXISTS domain_event_outbox_unprocessed_idx
  ON domain_event_outbox (created_at ASC)
  WHERE processed_at IS NULL AND failed_at IS NULL;

-- Future: partition-aware polling per cell by the platform event bus
CREATE INDEX IF NOT EXISTS domain_event_outbox_cell_idx
  ON domain_event_outbox (cell_id, created_at ASC)
  WHERE processed_at IS NULL AND failed_at IS NULL;
