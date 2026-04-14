import type { BlueprintMetadata } from '@ikary/cell-ai';

interface Props {
  blueprint: BlueprintMetadata;
  isLoading: boolean;
  isDisabled: boolean;
  onSelect: (id: string) => void;
}

/**
 * Single card in the blueprint grid. Pure presentation: the container
 * hook owns the loading state and the `isLoading` / `isDisabled` flags
 * flow in as props.
 */
export function BlueprintCard({ blueprint, isLoading, isDisabled, onSelect }: Props) {
  return (
    <button
      type="button"
      className={isLoading ? 'gallery-card is-loading' : 'gallery-card'}
      onClick={() => onSelect(blueprint.id)}
      disabled={isDisabled}
    >
      <div className="gallery-card-cat">{blueprint.category}</div>
      <div className="gallery-card-title">{blueprint.title}</div>
      {blueprint.description && <div className="gallery-card-desc">{blueprint.description}</div>}
    </button>
  );
}
