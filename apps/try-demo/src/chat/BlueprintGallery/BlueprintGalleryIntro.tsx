interface Props {
  onRunLocally?: () => void;
}

/**
 * Explanatory copy shown above the blueprint grid whenever the live AI
 * path is unavailable (global kill-switch, exhausted budget, or
 * `?demo=off` dev override).
 */
export function BlueprintGalleryIntro({ onRunLocally }: Props) {
  return (
    <div className="gallery-intro">
      <div className="gallery-title">Free demo allowance spent</div>
      <p>
        We&apos;re an open-source project and can&apos;t afford unlimited AI credits for every
        visitor. Our daily free-model budget will reset on the next tick.
      </p>
      <p>
        In the meantime, explore a pre-built manifest below. It renders in the same engine you&apos;d
        get live, so you&apos;ll see exactly what Ikary can do. For your own custom build with no
        rate limits,{' '}
        {onRunLocally ? (
          <button type="button" className="gallery-inline-cta" onClick={onRunLocally}>
            run it locally
          </button>
        ) : (
          <span>run it locally</span>
        )}{' '}
        with your own provider key.
      </p>
    </div>
  );
}
