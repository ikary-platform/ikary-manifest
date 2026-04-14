interface Props {
  filename: string;
}

export function PreviewLocallySection({ filename }: Props) {
  return (
    <section className="slide-section">
      <h3>2. Preview it locally</h3>
      <p>The Ikary CLI ships the same renderer you see here. Zero install (npm fetches it on demand):</p>
      <div className="slide-code">npx ikary preview {filename}</div>
      <p className="slide-section-note">
        For a persistent local stack with a real database and live hot-reload:
      </p>
      <div className="slide-code">{`npx ikary init my-app
cd my-app
mv ../${filename} ./manifests/${filename}
npx ikary dev`}</div>
    </section>
  );
}
