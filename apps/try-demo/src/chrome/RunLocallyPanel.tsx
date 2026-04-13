interface Props {
  manifest: unknown | null;
  onClose: () => void;
}

export function RunLocallyPanel({ manifest, onClose }: Props) {
  const slug = inferSlug(manifest) ?? 'my_app';
  const filename = `${slug}.json`;

  const downloadManifest = () => {
    if (!manifest) return;
    const text = JSON.stringify(manifest, null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="slide-overlay" onClick={onClose} />
      <aside className="slide-panel" role="dialog" aria-label="Run locally">
        <header className="slide-header">
          <div className="slide-title">Run this locally</div>
          <button className="slide-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="slide-body">
          <section className="slide-section">
            <h3>1. Download the manifest</h3>
            <p>
              Your generated app is a single declarative file. Save it, version it, edit it by hand
              (it&apos;s just JSON).
            </p>
            <button className="slide-action" onClick={downloadManifest} disabled={!manifest}>
              ⬇ Download {filename}
            </button>
          </section>

          <section className="slide-section">
            <h3>2. Preview it locally</h3>
            <p>
              The Ikary CLI ships the same renderer you see here. Zero install (npm fetches it on demand):
            </p>
            <div className="slide-code">npx ikary preview {filename}</div>
            <p style={{ marginTop: 12 }}>
              For a persistent local stack with a real database and live hot-reload:
            </p>
            <div className="slide-code">{`npx ikary init my-app
cd my-app
mv ../${filename} ./manifests/${filename}
npx ikary dev`}</div>
          </section>

          <section className="slide-section">
            <h3>3. Iterate with an AI agent</h3>
            <p>
              <strong>Claude Code: ready out of the box.</strong> When you run{' '}
              <code style={{ fontSize: 12 }}>npx ikary init</code>, Ikary registers its MCP server with Claude Code
              automatically. Just open the project and ask in plain English:
            </p>
            <div className="slide-code">
              &quot;Open {filename} and add a status enum to the expense entity.&quot;
            </div>
            <p style={{ marginTop: 12 }}>
              Using a different agent (Codex CLI, Cursor, Continue, your own)? Plug into the public Ikary MCP
              endpoint to give it the same contract awareness:
            </p>
            <div className="slide-code">
              {`https://mcp.ikary.co/v1`}
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}

function inferSlug(manifest: unknown): string | null {
  if (!manifest || typeof manifest !== 'object') return null;
  const meta = (manifest as { metadata?: { key?: unknown } }).metadata;
  if (meta && typeof meta.key === 'string') return meta.key;
  return null;
}
