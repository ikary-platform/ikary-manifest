import * as React from 'react';

export interface AccentColorFieldProps {
  value: string | null;
  onChange: (next: string | null) => void;
  id?: string;
  disabled?: boolean;
}

function isValidHex(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

export function AccentColorField({ value, onChange, id, disabled }: AccentColorFieldProps) {
  const useSystem = value === null;
  const [draft, setDraft] = React.useState<string>(value ?? '#2563EB');

  React.useEffect(() => {
    if (value !== null) setDraft(value);
  }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={useSystem}
          disabled={disabled}
          onChange={(event) => {
            if (event.currentTarget.checked) onChange(null);
            else onChange(isValidHex(draft) ? draft : '#2563EB');
          }}
        />
        <span>Use system default (bare shadcn)</span>
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          id={id}
          value={isValidHex(draft) ? draft : '#2563EB'}
          disabled={disabled || useSystem}
          onChange={(event) => {
            const next = event.currentTarget.value.toUpperCase();
            setDraft(next);
            onChange(next);
          }}
          className="h-9 w-12 rounded border border-input bg-background disabled:opacity-50"
        />
        <input
          type="text"
          value={draft}
          disabled={disabled || useSystem}
          onChange={(event) => {
            const next = event.currentTarget.value;
            setDraft(next);
            if (isValidHex(next)) onChange(next);
          }}
          placeholder="#2563EB"
          className="h-9 w-28 rounded border border-input bg-background px-2 text-sm disabled:opacity-50"
        />
      </div>
    </div>
  );
}
