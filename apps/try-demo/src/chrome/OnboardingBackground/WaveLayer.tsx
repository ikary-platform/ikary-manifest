interface Props {
  /** CSS class that supplies both position (`.ob-wave-layer-*`) and animation. */
  speedClass: 'ob-wave-layer-slow' | 'ob-wave-layer-mid' | 'ob-wave-layer-fast';
  viewBox: string;
  /** SVG path `d` string. */
  d: string;
  /** CSS variable reference (for example `var(--ob-wave-1)`) painted into the path fill. */
  fillVar: string;
}

/**
 * One animated wave layer. Reused for slow/mid/fast variants with different
 * paths and `--ob-wave-N` fill tokens. All positioning lives in CSS.
 *
 * The single tolerated inline style is the `fill` on the path element: SVG
 * path `fill` does not consistently inherit `currentColor` across browsers
 * when the value comes from a CSS variable, so the token reference lives
 * here as a `var(--...)` string (never a literal color).
 */
export function WaveLayer({ speedClass, viewBox, d, fillVar }: Props) {
  return (
    <div className={`ob-wave-layer ${speedClass}`}>
      <svg viewBox={viewBox} preserveAspectRatio="none" className="ob-wave-svg">
        <path d={d} style={{ fill: fillVar }} />
      </svg>
    </div>
  );
}
