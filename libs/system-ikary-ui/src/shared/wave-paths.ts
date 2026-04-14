/**
 * SVG path data for the three wave layers. Extracted so the component
 * markup stays trivially readable (no inline path strings) and the curves
 * are tweakable in one place without touching JSX.
 *
 * Import from `@ikary/system-ikary-ui` (root entry).
 */

export const WAVE_SLOW_PATH =
  'M0,160 C200,60 520,260 720,160 C920,60 1240,260 1440,160 C1640,60 1960,260 2160,160 C2360,60 2680,260 2880,160 L2880,380 L0,380 Z';

export const WAVE_MID_PATH =
  'M0,100 C120,180 360,20 480,100 C600,180 840,20 960,100 C1080,180 1320,20 1440,100 C1560,180 1800,20 1920,100 C2040,180 2280,20 2400,100 C2520,180 2760,20 2880,100 L2880,280 L0,280 Z';

export const WAVE_FAST_PATH =
  'M0,70 C160,130 320,20 480,70 C640,120 800,15 960,70 C1120,125 1280,15 1440,70 C1600,130 1760,20 1920,70 C2080,120 2240,15 2400,70 C2560,125 2720,15 2880,70 L2880,190 L0,190 Z';

export const WAVE_SLOW_VIEWBOX = '0 0 2880 380';
export const WAVE_MID_VIEWBOX = '0 0 2880 280';
export const WAVE_FAST_VIEWBOX = '0 0 2880 190';
