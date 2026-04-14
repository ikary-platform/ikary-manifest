import * as React from 'react';
import type { ThemeMode } from '../../shared/cell-branding.schema.js';

export interface ThemeModeFieldProps {
  value: ThemeMode | null;
  onChange: (next: ThemeMode | null) => void;
  id?: string;
  disabled?: boolean;
}

const OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'auto', label: 'Respect user preference' },
  { value: 'light', label: 'Force light mode' },
  { value: 'dark', label: 'Force dark mode' },
];

export function ThemeModeField({ value, onChange, id, disabled }: ThemeModeFieldProps) {
  const current = value ?? 'auto';
  return (
    <select
      id={id}
      value={current}
      disabled={disabled}
      onChange={(event) => {
        const next = event.currentTarget.value;
        if (next === 'auto') onChange(null);
        else onChange(next as ThemeMode);
      }}
      className="h-9 rounded border border-input bg-background px-2 text-sm disabled:opacity-50"
    >
      {OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
