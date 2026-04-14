/**
 * Idle-state floating message shown on top of the onboarding background
 * when no manifest has been requested yet.
 */
export function PreviewEmpty() {
  return (
    <div className="preview-floating">
      <div className="preview-floating-title">Your generated app will appear here</div>
      <div className="preview-floating-sub">Describe an app on the left to start.</div>
    </div>
  );
}
