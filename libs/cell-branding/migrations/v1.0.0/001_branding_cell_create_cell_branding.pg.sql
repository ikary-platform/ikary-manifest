BEGIN;

-- cell_id is TEXT rather than UUID because manifest-declared cells identify
-- by slug (e.g. "crm", "e2e_local"), not UUID. The shared Zod schema
-- constrains to min(1) length; UUIDs remain valid values.
CREATE TABLE IF NOT EXISTS cell_branding (
  cell_id TEXT PRIMARY KEY,
  accent_color TEXT,
  title_font_family TEXT,
  body_font_family TEXT,
  default_theme_mode TEXT CHECK (default_theme_mode IS NULL OR default_theme_mode IN ('light', 'dark')),
  version INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cell_branding_updated_at_idx
  ON cell_branding (updated_at DESC);

COMMIT;
