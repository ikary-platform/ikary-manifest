import { useTheme, type ThemeMode } from '../hooks/useTheme';

export interface ThemeToggleProps {
  /** Controlled mode — omit to use the internal `useTheme` hook. */
  mode?: ThemeMode;
  /** Called with the next mode when the user toggles. */
  onModeChange?: (mode: ThemeMode) => void;
  /** Extra class names to merge with the built-in styles. */
  className?: string;
  /** Size in pixels (square). Default 36. */
  size?: number;
  /** Accessible label prefix. Actual label becomes `${label} ${next-mode} mode`. */
  label?: string;
}

/**
 * Accessible light/dark theme toggle. Works uncontrolled (internal `useTheme`)
 * or controlled via `mode` + `onModeChange`. Toggling applies the `.dark` class
 * to `document.documentElement` and persists to `localStorage['ikary-theme']`.
 *
 * Uncontrolled usage:
 *   <ThemeToggle />
 *
 * Controlled usage:
 *   const theme = useTheme();
 *   <ThemeToggle mode={theme.mode} onModeChange={theme.setMode} />
 */
export function ThemeToggle(props: ThemeToggleProps) {
  const internal = useTheme();
  const mode: ThemeMode = props.mode ?? internal.mode;
  const setMode = (next: ThemeMode) => {
    if (props.onModeChange) props.onModeChange(next);
    else internal.setMode(next);
  };
  const next: ThemeMode = mode === 'dark' ? 'light' : 'dark';
  const size = props.size ?? 36;
  const baseClass = 'ikary-theme-toggle';
  const className = props.className ? `${baseClass} ${props.className}` : baseClass;
  const labelPrefix = props.label ?? 'Switch to';

  return (
    <button
      type="button"
      onClick={() => setMode(next)}
      aria-label={`${labelPrefix} ${next} mode`}
      title={`${labelPrefix} ${next} mode`}
      className={className}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        border: '1px solid var(--ikary-theme-toggle-border, rgba(0,0,0,0.12))',
        background: 'var(--ikary-theme-toggle-bg, transparent)',
        color: 'var(--ikary-theme-toggle-color, currentColor)',
        cursor: 'pointer',
        transition: 'background-color 150ms ease, border-color 150ms ease, color 150ms ease',
      }}
    >
      {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}
