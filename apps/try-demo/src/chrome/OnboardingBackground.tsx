interface Props {
  mode?: 'fixed' | 'absolute';
}

/**
 * Animated ambient background - ported from
 * harbor/apps/ikary-ui/src/Onboarding/OnboardingBackground.tsx.
 * Colours come from CSS variables in styles.css; respond to the `.dark` class.
 */
export function OnboardingBackground({ mode = 'fixed' }: Props) {
  const position: 'fixed' | 'absolute' = mode;
  const absoluteStyle: React.CSSProperties = { position, inset: 0, zIndex: -1, overflow: 'hidden' };

  return (
    <div className="ob-bg" style={absoluteStyle} aria-hidden="true">
      {/* Ambient glows */}
      <div
        className="ob-glow-top-radial ob-glow-pulse"
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          top: '-20%',
          left: '25%',
          width: '70%',
          height: '65%',
        }}
      />
      <div
        className="ob-glow-bottom-radial ob-glow-pulse"
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          bottom: '-5%',
          right: '-10%',
          width: '55%',
          height: '60%',
        }}
      />

      {/* Wave 1 - slow, deepest */}
      <div
        className="ob-wave-slow"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          pointerEvents: 'none',
          width: '200%',
          height: 380,
        }}
      >
        <svg viewBox="0 0 2880 380" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
          <path
            style={{ fill: 'var(--ob-wave-1)' }}
            d="M0,160 C200,60 520,260 720,160 C920,60 1240,260 1440,160 C1640,60 1960,260 2160,160 C2360,60 2680,260 2880,160 L2880,380 L0,380 Z"
          />
        </svg>
      </div>

      {/* Wave 2 - medium */}
      <div
        className="ob-wave-mid"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          pointerEvents: 'none',
          width: '200%',
          height: 280,
        }}
      >
        <svg viewBox="0 0 2880 280" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
          <path
            style={{ fill: 'var(--ob-wave-2)' }}
            d="M0,100 C120,180 360,20 480,100 C600,180 840,20 960,100 C1080,180 1320,20 1440,100 C1560,180 1800,20 1920,100 C2040,180 2280,20 2400,100 C2520,180 2760,20 2880,100 L2880,280 L0,280 Z"
          />
        </svg>
      </div>

      {/* Edge vignettes */}
      <div
        className="ob-vignette-l"
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, zIndex: 10, pointerEvents: 'none' }}
      />
      <div
        className="ob-vignette-r"
        style={{ position: 'absolute', top: 0, bottom: 0, right: 0, zIndex: 10, pointerEvents: 'none' }}
      />

      {/* Wave 3 - fast, accent */}
      <div
        className="ob-wave-fast"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          pointerEvents: 'none',
          width: '200%',
          height: 190,
        }}
      >
        <svg viewBox="0 0 2880 190" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
          <path
            style={{ fill: 'var(--ob-wave-3)' }}
            d="M0,70 C160,130 320,20 480,70 C640,120 800,15 960,70 C1120,125 1280,15 1440,70 C1600,130 1760,20 1920,70 C2080,120 2240,15 2400,70 C2560,125 2720,15 2880,70 L2880,190 L0,190 Z"
          />
        </svg>
      </div>
    </div>
  );
}
