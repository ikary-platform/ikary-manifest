CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_key TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  resource_version INTEGER NOT NULL,
  change_kind TEXT NOT NULL,
  snapshot TEXT NOT NULL,
  diff TEXT,
  occurred_at TEXT NOT NULL
);
