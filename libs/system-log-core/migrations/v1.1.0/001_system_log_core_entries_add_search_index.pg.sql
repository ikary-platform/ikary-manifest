CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_platform_logs_message_trgm
  ON platform_logs USING gin (message gin_trgm_ops);
