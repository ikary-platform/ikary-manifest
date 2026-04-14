import * as React from 'react';
import { useBranding } from '../hooks/useBranding.js';
import { useUpdateBranding } from '../hooks/useUpdateBranding.js';
import { useResetBranding } from '../hooks/useResetBranding.js';
import type { CellBranding, ThemeMode } from '../../shared/cell-branding.schema.js';
import { AccentColorField } from './AccentColorField.js';
import { FontFamilyField } from './FontFamilyField.js';
import { ThemeModeField } from './ThemeModeField.js';

export interface BrandingAdminPanelProps {
  cellId: string;
  title?: string;
  className?: string;
  onSaved?: (branding: CellBranding) => void;
}

interface DraftState {
  accentColor: string | null;
  titleFontFamily: string | null;
  bodyFontFamily: string | null;
  defaultThemeMode: ThemeMode | null;
}

function draftFromBranding(branding: CellBranding | null): DraftState {
  return {
    accentColor: branding?.accentColor ?? null,
    titleFontFamily: branding?.titleFontFamily ?? null,
    bodyFontFamily: branding?.bodyFontFamily ?? null,
    defaultThemeMode: branding?.defaultThemeMode ?? null,
  };
}

function areEqual(a: DraftState, b: DraftState): boolean {
  return (
    a.accentColor === b.accentColor &&
    a.titleFontFamily === b.titleFontFamily &&
    a.bodyFontFamily === b.bodyFontFamily &&
    a.defaultThemeMode === b.defaultThemeMode
  );
}

export function BrandingAdminPanel({ cellId, title, className, onSaved }: BrandingAdminPanelProps) {
  const [branding, loading, error] = useBranding(cellId);
  const updateBranding = useUpdateBranding();
  const resetBranding = useResetBranding();

  const [draft, setDraft] = React.useState<DraftState>(() => draftFromBranding(branding));
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const brandingVersion = branding?.version ?? 0;
  React.useEffect(() => {
    setDraft(draftFromBranding(branding));
  }, [brandingVersion, branding]);

  const persisted = draftFromBranding(branding);
  const dirty = !areEqual(draft, persisted);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const result = await updateBranding(cellId, {
        expectedVersion: brandingVersion,
        accentColor: draft.accentColor,
        titleFontFamily: draft.titleFontFamily,
        bodyFontFamily: draft.bodyFontFamily,
        defaultThemeMode: draft.defaultThemeMode,
      });
      setMessage('Saved.');
      onSaved?.(result);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    setSaving(true);
    setMessage(null);
    try {
      await resetBranding(cellId, { expectedVersion: brandingVersion });
      setMessage('Reset to system defaults.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className={['flex flex-col gap-4 rounded-lg border border-border bg-card p-4 text-card-foreground', className]
        .filter(Boolean)
        .join(' ')}
    >
      <header className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{title ?? 'Branding'}</h2>
        <span className="text-xs text-muted-foreground">
          cell: <code>{cellId}</code> · version {brandingVersion}
        </span>
      </header>

      {loading ? <p className="text-sm text-muted-foreground">Loading branding…</p> : null}
      {error ? (
        <p className="text-sm text-destructive">
          Failed to load branding: {error instanceof Error ? error.message : String(error)}
        </p>
      ) : null}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Accent color</label>
          <AccentColorField
            value={draft.accentColor}
            onChange={(next) => setDraft((d) => ({ ...d, accentColor: next }))}
            disabled={saving}
          />
        </div>

        <FontFamilyField
          label="Title font"
          value={draft.titleFontFamily}
          onChange={(next) => setDraft((d) => ({ ...d, titleFontFamily: next }))}
          disabled={saving}
        />

        <FontFamilyField
          label="Body font"
          value={draft.bodyFontFamily}
          onChange={(next) => setDraft((d) => ({ ...d, bodyFontFamily: next }))}
          disabled={saving}
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Default theme mode</label>
          <ThemeModeField
            value={draft.defaultThemeMode}
            onChange={(next) => setDraft((d) => ({ ...d, defaultThemeMode: next }))}
            disabled={saving}
          />
        </div>
      </div>

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

      <footer className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleReset}
          disabled={saving || brandingVersion === 0}
          className="h-9 rounded border border-input bg-background px-3 text-sm disabled:opacity-50"
        >
          Reset to defaults
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !dirty}
          className="h-9 rounded bg-primary px-3 text-sm text-primary-foreground disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </footer>
    </section>
  );
}
