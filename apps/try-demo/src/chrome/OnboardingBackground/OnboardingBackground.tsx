import { AmbientGlows } from './AmbientGlows';
import { EdgeVignettes } from './EdgeVignettes';
import { WaveLayer } from './WaveLayer';
import {
  WAVE_FAST_PATH,
  WAVE_FAST_VIEWBOX,
  WAVE_MID_PATH,
  WAVE_MID_VIEWBOX,
  WAVE_SLOW_PATH,
  WAVE_SLOW_VIEWBOX,
} from './wave-paths';

interface Props {
  /**
   * Layout mode. `fixed` (default) for the full-page shell; `absolute` when
   * the background must live inside a positioned ancestor (for example a
   * preview card or a storybook canvas).
   */
  mode?: 'fixed' | 'absolute';
}

/**
 * Animated ambient background: waves + radial glows + edge vignettes.
 * All positioning and colors are driven by CSS tokens declared in
 * `styles.css`; this component only composes the layers.
 */
export function OnboardingBackground({ mode = 'fixed' }: Props) {
  const modeClass = mode === 'absolute' ? 'ob-bg--absolute' : 'ob-bg--fixed';
  return (
    <div className={`ob-bg ${modeClass}`} aria-hidden="true">
      <AmbientGlows />
      <WaveLayer
        speedClass="ob-wave-layer-slow"
        viewBox={WAVE_SLOW_VIEWBOX}
        d={WAVE_SLOW_PATH}
        fillVar="var(--ob-wave-1)"
      />
      <WaveLayer
        speedClass="ob-wave-layer-mid"
        viewBox={WAVE_MID_VIEWBOX}
        d={WAVE_MID_PATH}
        fillVar="var(--ob-wave-2)"
      />
      <EdgeVignettes />
      <WaveLayer
        speedClass="ob-wave-layer-fast"
        viewBox={WAVE_FAST_VIEWBOX}
        d={WAVE_FAST_PATH}
        fillVar="var(--ob-wave-3)"
      />
    </div>
  );
}
