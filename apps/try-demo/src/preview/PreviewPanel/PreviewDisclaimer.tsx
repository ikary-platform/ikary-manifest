interface Props {
  onRunLocally: () => void;
}

/**
 * Subtle banner that surfaces above the preview card whenever a manifest is
 * showing. Fake data, resets on reload, and the user can escape to the
 * Run-locally panel for real persistence.
 */
export function PreviewDisclaimer({ onRunLocally }: Props) {
  return (
    <div className="preview-disclaimer" role="note">
      <span className="preview-disclaimer-icon" aria-hidden="true">
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="8" cy="8" r="7" />
          <path d="M8 5v3.5" />
          <circle cx="8" cy="11" r="0.75" fill="currentColor" />
        </svg>
      </span>
      <span>
        <strong>Preview mode.</strong> Data is fake and resets on reload. To persist your app with a
        real database, click{' '}
        <button type="button" className="preview-disclaimer-cta" onClick={onRunLocally}>
          Run locally
        </button>
        .
      </span>
    </div>
  );
}
