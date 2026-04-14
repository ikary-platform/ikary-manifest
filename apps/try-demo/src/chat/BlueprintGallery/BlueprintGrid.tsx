import type { BlueprintMetadata } from '@ikary/cell-ai';
import { BlueprintCard } from './BlueprintCard';

interface Props {
  blueprints: BlueprintMetadata[];
  loadingId: string | null;
  onSelect: (id: string) => void;
}

export function BlueprintGrid({ blueprints, loadingId, onSelect }: Props) {
  return (
    <div className="gallery-grid">
      {blueprints.map((bp) => (
        <BlueprintCard
          key={bp.id}
          blueprint={bp}
          isLoading={loadingId === bp.id}
          isDisabled={loadingId !== null && loadingId !== bp.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
