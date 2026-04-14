import * as React from 'react';

const COMMON_FONTS = [
  '"Inter", sans-serif',
  '"Roboto", sans-serif',
  '"Open Sans", sans-serif',
  '"Lato", sans-serif',
  '"Merriweather", serif',
  '"Playfair Display", serif',
  '"IBM Plex Sans", sans-serif',
  '"IBM Plex Mono", monospace',
];

export interface FontFamilyFieldProps {
  label: string;
  value: string | null;
  onChange: (next: string | null) => void;
  id?: string;
  disabled?: boolean;
}

export function FontFamilyField({ label, value, onChange, id, disabled }: FontFamilyFieldProps) {
  const useSystem = value === null;
  const presetMatch = value && COMMON_FONTS.includes(value) ? value : 'custom';

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={useSystem}
          disabled={disabled}
          onChange={(event) => {
            onChange(event.currentTarget.checked ? null : COMMON_FONTS[0]!);
          }}
        />
        <span>Use system default (bare shadcn)</span>
      </label>
      <div className="flex items-center gap-2">
        <select
          id={id}
          value={useSystem ? '' : presetMatch}
          disabled={disabled || useSystem}
          onChange={(event) => {
            const next = event.currentTarget.value;
            if (next === 'custom') return;
            onChange(next);
          }}
          className="h-9 rounded border border-input bg-background px-2 text-sm disabled:opacity-50"
        >
          {COMMON_FONTS.map((font) => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
          <option value="custom">Custom…</option>
        </select>
        {presetMatch === 'custom' && !useSystem ? (
          <input
            type="text"
            value={value ?? ''}
            disabled={disabled}
            onChange={(event) => onChange(event.currentTarget.value || null)}
            placeholder='"Your Font", sans-serif'
            className="h-9 flex-1 rounded border border-input bg-background px-2 text-sm disabled:opacity-50"
          />
        ) : null}
      </div>
    </div>
  );
}
