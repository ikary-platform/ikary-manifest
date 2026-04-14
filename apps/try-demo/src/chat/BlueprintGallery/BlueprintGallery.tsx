import { useBlueprints, useBlueprintLoader } from '../../hooks';
import { BlueprintGalleryIntro } from './BlueprintGalleryIntro';
import { BlueprintGrid } from './BlueprintGrid';

interface Props {
  onManifestLoaded: (blueprintId: string, manifest: unknown) => void;
  onRunLocally?: () => void;
}

/**
 * Offline fallback surface shown in the chat rail when the live AI path is
 * unavailable. Composes three children and owns no local state; data comes
 * from `useBlueprints`, on-click hydration from `useBlueprintLoader`.
 */
export function BlueprintGallery({ onManifestLoaded, onRunLocally }: Props) {
  const { data: blueprints, isPending, error } = useBlueprints();
  const { load, loadingId, error: loadError } = useBlueprintLoader();

  const select = async (id: string) => {
    const result = await load(id);
    onManifestLoaded(result.blueprintId, result.manifest);
  };

  return (
    <div className="gallery">
      <BlueprintGalleryIntro onRunLocally={onRunLocally} />
      <div className="gallery-section-title">Test one of our blueprints</div>
      {(error || loadError) && (
        <div className="gallery-error">
          Could not load blueprints: {(error ?? loadError)!.message}
        </div>
      )}
      {isPending && <div className="gallery-loading">Loading blueprints…</div>}
      {!isPending && blueprints && blueprints.length === 0 && (
        <div className="gallery-loading">No blueprints available.</div>
      )}
      {blueprints && blueprints.length > 0 && (
        <BlueprintGrid
          blueprints={blueprints}
          loadingId={loadingId}
          onSelect={(id) => void select(id)}
        />
      )}
    </div>
  );
}
