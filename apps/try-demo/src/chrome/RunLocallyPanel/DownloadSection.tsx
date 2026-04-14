import { useManifestDownload } from '../../hooks';

interface Props {
  manifest: unknown | null;
  filename: string;
}

export function DownloadSection({ manifest, filename }: Props) {
  const { download } = useManifestDownload();
  return (
    <section className="slide-section">
      <h3>1. Download the manifest</h3>
      <p>
        Your generated app is a single declarative file. Save it, version it, edit it by hand
        (it&apos;s just JSON).
      </p>
      <button
        type="button"
        className="slide-action"
        onClick={() => download(manifest, filename)}
        disabled={!manifest}
      >
        ⬇ Download {filename}
      </button>
    </section>
  );
}
