import { useId } from 'react';

export type IkaryLogoVariant =
  | 'full-auto'
  | 'full-black'
  | 'full-white'
  | 'full-original'
  | 'symbol-auto'
  | 'symbol-original'
  | 'symbol-white';

export interface IkaryLogoProps {
  /**
   * Visual variant.
   * - `full-auto` — full wordmark; black in light mode, white in dark mode (CSS swap, zero JS).
   * - `full-black` — full wordmark, always black (`#231f20`).
   * - `full-white` — full wordmark, always white.
   * - `full-original` — full wordmark with original navy + blue-gradient colors.
   * - `symbol-auto` — symbol only; gradient in light mode, white in dark mode.
   * - `symbol-original` — symbol only, always with blue-to-navy gradient.
   * - `symbol-white` — symbol only, always white.
   */
  variant?: IkaryLogoVariant;
  /** Rendered height in pixels. Width scales proportionally via viewBox. Default: 24. */
  height?: number;
  /** Forwarded to the wrapping `<svg>` (or outer `<span>` for `*-auto` variants). */
  className?: string;
}

/** viewBox dimensions for each SVG asset. */
const FULL_VIEWBOX = '0 0 975.8561 240.5992';
const SYMBOL_VIEWBOX = '0 0 285.4564 240.5992';

/** Aspect ratios (width / height) derived from the viewBoxes above. */
const FULL_ASPECT = 975.8561 / 240.5992;
const SYMBOL_ASPECT = 285.4564 / 240.5992;

/** Shared path data for the five letter-forms (I K A R Y body). */
const FULL_BODY_PATHS = (
  <>
    {/* R */}
    <path d="M614.0034,153.9323s12.2901,19.4634,25.3716,32.0223c27.4031,26.3084,58.6056,33.9965,96.7862,29.0135-29.7668-11.9258-50.1882-46.6627-70.4562-76.8409,26.1674-9.4938,49.0645-22.8596,51.2129-62.2867,2.3846-43.7538-23.4406-63.2279-52.9418-71.4808-12.1226-2.4477-23.7246-4.1341-36.2805-4.1307l-106.8347.0306.1144,194.6916,48.5087.2094.1424-49.6229,29.0304-.4191c5.8734-.085,11.4811,3.1355,15.3465,8.8137ZM569.5825,108.1442l.1657-65.3235,49.536-.2649c17.5102-.1749,46.8782,2.1446,47.4837,31.0199.537,25.586-20.2439,34.2243-36.2453,34.2959l-60.9402.2725Z" />
    {/* K */}
    <path d="M284.6879,194.9775l-67.3936-88.3072-20.7744-27.5782L272.1621.8534l-54.1337-.5091-54.9038,55.4109-26.4628,26.4843L136.423.0366l-49.1747.7226.072,194.2423,49.0384.1072.2143-59.0463,16.3589-16.3091c4.7507-4.7358,11.5178-4.1081,15.6891,1.4556l55.2635,73.7157,56.3774.0463,4.426.0067Z" />
    {/* A */}
    <path d="M433.8088.0638l-67.2323.2224-76.4787,194.6843,2.5038.0016,48.6457.0394,8.3892-21.4315c2.9663-7.5793,9.0108-12.3591,15.6164-12.3507l85.1612.1087,13.6567,33.8592,51.3801-.328L433.8088.0638ZM366.8796,124.9315l33.961-89.5931,35.5211,89.4465-69.4821.1466Z" />
    {/* I */}
    <polygon points="48.9814 194.8551 .0604 195.2269 0 .3912 49.0298 .1227 48.9814 194.8551" />
    {/* Y body (lower) */}
    <path d="M844.3457,99.9139l-29.4749,46.6446-43.9529-60.1287L709.0604.4232l53.3685-.0786c7.2257-.0106,14.119,3.8964,18.9819,10.7587l62.9348,88.8106Z" />
  </>
);

/** The Y-swoosh path used in full logos. */
const FULL_Y_SWOOSH =
  'M926.362.8372c-14.6507,2.9045-20.3224,12.1361-28.0846,25.5187-5.2897,8.7625-10.8544,17.9836-16.1331,26.7286-18.9552,31.3213-37.2418,61.173-57.2533,91.4448-11.0394,16.6876-22.8317,33.2108-37.0919,47.1794-24.4656,25.3958-57.0999,37.3721-92.0308,30.6905-3.1517-.5063-5.3686-.9591-5.3686-.9591,0,0,.2751.7063.4372.8211,40.4589,28.6684,95.7283,18.6551,119.2976,4.1447,8.632-5.3142,20.2908-15.4014,27.122-22.8508C869.3654,169.2637,975.8561.1451,975.8561.1451c0,0-36.7925-.6038-49.2443.6519l-.2498.0401Z';

/** The Y-swoosh path used in the symbol (smaller viewBox). */
const SYMBOL_Y_SWOOSH =
  'M235.9623.8372c-14.6507,2.9045-20.3224,12.1361-28.0846,25.5187-5.2897,8.7625-10.8544,17.9836-16.1331,26.7286-18.9552,31.3213-37.2418,61.173-57.2533,91.4448-11.0394,16.6876-22.8317,33.2108-37.0919,47.1794-24.4656,25.3958-57.0999,37.3721-92.0308,30.6905-3.1517-.5063-5.3686-.9591-5.3686-.9591,0,0,.2751.7063.4372.8211,40.4589,28.6684,95.7283,18.6551,119.2976,4.1447,8.632-5.3142,20.2908-15.4014,27.122-22.8508C178.9657,169.2637,285.4564.1451,285.4564.1451c0,0-36.7925-.6038-49.2443.6519l-.2498.0401Z';

/** The symbol lower-left chevron path. */
const SYMBOL_CHEVRON =
  'M153.946,99.9139l-29.4749,46.6446-43.9529-60.1287L18.6607.4232l53.3685-.0786c7.2257-.0106,14.119,3.8964,18.9819,10.7587l62.9348,88.8106Z';

/** Gradient stop colors shared by all original-color variants. */
const GRADIENT_STOPS = (
  <>
    <stop offset="0" stopColor="#5c7cff" />
    <stop offset=".1165" stopColor="#5877f6" />
    <stop offset=".3007" stopColor="#506cdf" />
    <stop offset=".5294" stopColor="#425aba" />
    <stop offset=".7912" stopColor="#2f4087" />
    <stop offset="1" stopColor="#1f2a5a" />
  </>
);

/** Full wordmark — all paths in a single flat color. */
function FullSolid({ fill, height, className }: { fill: string; height: number; className?: string }) {
  const w = Math.round(height * FULL_ASPECT);
  return (
    <svg
      viewBox={FULL_VIEWBOX}
      width={w}
      height={height}
      fill={fill}
      aria-hidden="true"
      className={className}
    >
      {FULL_BODY_PATHS}
      <path d={FULL_Y_SWOOSH} />
    </svg>
  );
}

/** Full wordmark — body navy, Y-swoosh with blue-to-navy gradient. */
function FullOriginal({ height, className }: { height: number; className?: string }) {
  const id = useId();
  const gradId = `${id}-fg`;
  const w = Math.round(height * FULL_ASPECT);
  return (
    <svg
      viewBox={FULL_VIEWBOX}
      width={w}
      height={height}
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient
          id={gradId}
          x1="749.3358"
          y1="255.9249"
          x2="895.6444"
          y2="2.5109"
          gradientUnits="userSpaceOnUse"
        >
          {GRADIENT_STOPS}
        </linearGradient>
      </defs>
      <g fill="#1f2a5a">{FULL_BODY_PATHS}</g>
      <path d={FULL_Y_SWOOSH} fill={`url(#${gradId})`} />
    </svg>
  );
}

/** Symbol only — Y-swoosh with blue-to-navy gradient + lower chevron in navy. */
function SymbolOriginal({ height, className }: { height: number; className?: string }) {
  const id = useId();
  const gradId = `${id}-sg`;
  const w = Math.round(height * SYMBOL_ASPECT);
  return (
    <svg
      viewBox={SYMBOL_VIEWBOX}
      width={w}
      height={height}
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient
          id={gradId}
          x1="58.9361"
          y1="255.9249"
          x2="205.2447"
          y2="2.5109"
          gradientUnits="userSpaceOnUse"
        >
          {GRADIENT_STOPS}
        </linearGradient>
      </defs>
      <path d={SYMBOL_Y_SWOOSH} fill={`url(#${gradId})`} />
      <path d={SYMBOL_CHEVRON} fill="#1f2a5a" />
    </svg>
  );
}

/** Symbol only — all paths in a single flat color. */
function SymbolSolid({ fill, height, className }: { fill: string; height: number; className?: string }) {
  const w = Math.round(height * SYMBOL_ASPECT);
  return (
    <svg
      viewBox={SYMBOL_VIEWBOX}
      width={w}
      height={height}
      fill={fill}
      aria-hidden="true"
      className={className}
    >
      <path d={SYMBOL_Y_SWOOSH} />
      <path d={SYMBOL_CHEVRON} />
    </svg>
  );
}

/**
 * Self-contained IKARY logo component with inlined SVG paths — no external
 * file requests. The `full-auto` and `symbol-auto` variants use a zero-JS
 * CSS swap technique (`.ikary-logo-light / .ikary-logo-dark` classes toggled
 * by the `.dark` class on `<html>`) to switch between the light and dark
 * versions without a React re-render.
 *
 * Requires `@ikary/system-ikary-ui/styles` to be imported for the auto variants.
 */
export function IkaryLogo({ variant = 'full-auto', height = 24, className }: IkaryLogoProps) {
  switch (variant) {
    case 'full-black':
      return <FullSolid fill="#231f20" height={height} className={className} />;

    case 'full-white':
      return <FullSolid fill="#ffffff" height={height} className={className} />;

    case 'full-original':
      return <FullOriginal height={height} className={className} />;

    case 'symbol-original':
      return <SymbolOriginal height={height} className={className} />;

    case 'symbol-white':
      return <SymbolSolid fill="#ffffff" height={height} className={className} />;

    case 'symbol-auto':
      return (
        <span
          style={{ display: 'inline-flex', alignItems: 'center' }}
          className={className}
          aria-hidden="true"
        >
          <SymbolOriginal height={height} className="ikary-logo-light" />
          <SymbolSolid fill="#ffffff" height={height} className="ikary-logo-dark" />
        </span>
      );

    case 'full-auto':
    default:
      return (
        <span
          style={{ display: 'inline-flex', alignItems: 'center' }}
          className={className}
          aria-hidden="true"
        >
          <FullSolid fill="#231f20" height={height} className="ikary-logo-light" />
          <FullSolid fill="#ffffff" height={height} className="ikary-logo-dark" />
        </span>
      );
  }
}
