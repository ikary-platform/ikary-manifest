/**
 * Two pulsing radial glows that sit above the waves and below the content.
 * Positioning + colors come from `.ob-glow-top` / `.ob-glow-bottom` rules
 * in `brand.css`. The pulse animation is shared via `.ob-glow-pulse`.
 */
export function AmbientGlows() {
  return (
    <>
      <div className="ob-glow-top ob-glow-pulse" aria-hidden="true" />
      <div className="ob-glow-bottom ob-glow-pulse" aria-hidden="true" />
    </>
  );
}
