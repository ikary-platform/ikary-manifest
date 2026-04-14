import { inferSlug } from './infer-slug';
import { DownloadSection } from './DownloadSection';
import { PreviewLocallySection } from './PreviewLocallySection';
import { IterateWithAgentSection } from './IterateWithAgentSection';

interface Props {
  manifest: unknown | null;
  onClose: () => void;
}

/**
 * Slide-in panel with the three sections a user needs to take their demo
 * manifest locally: download, preview via CLI, and iterate with an AI agent.
 */
export function RunLocallyPanel({ manifest, onClose }: Props) {
  const slug = inferSlug(manifest) ?? 'my_app';
  const filename = `${slug}.json`;

  return (
    <>
      <div className="slide-overlay" onClick={onClose} />
      <aside className="slide-panel" role="dialog" aria-label="Run locally">
        <header className="slide-header">
          <div className="slide-title">Run this locally</div>
          <button type="button" className="slide-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="slide-body">
          <DownloadSection manifest={manifest} filename={filename} />
          <PreviewLocallySection filename={filename} />
          <IterateWithAgentSection filename={filename} />
        </div>
      </aside>
    </>
  );
}
