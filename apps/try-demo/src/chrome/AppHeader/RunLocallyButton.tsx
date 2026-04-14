interface Props {
  disabled: boolean;
  onClick: () => void;
}

/**
 * Header action that opens the Run-locally slide panel. Disabled state is
 * driven entirely by the `disabled` HTML attribute + CSS, never by inline
 * `style={{}}` values.
 */
export function RunLocallyButton({ disabled, onClick }: Props) {
  return (
    <button
      type="button"
      className="header-link header-link-play"
      onClick={onClick}
      disabled={disabled}
      aria-label="Run locally"
    >
      <svg width="11" height="11" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
        <path d="M3 1.5v11l9-5.5L3 1.5Z" />
      </svg>
      Run locally
    </button>
  );
}
