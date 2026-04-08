import { useMemo } from 'react';
import { useCellManifest } from '../../context/cell-runtime-context';
import { resolveManifestEntity } from '../../manifest/selectors';
import { EntityCreateFormContent } from './EntityCreateFormContent';

interface EntityCreateSheetProps {
  entityKey: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EntityCreateSheet({ entityKey, open, onOpenChange }: EntityCreateSheetProps) {
  const manifest = useCellManifest();
  const entity = useMemo(() => resolveManifestEntity(manifest, entityKey), [manifest, entityKey]);

  if (!entity) {
    return null;
  }

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40" onClick={() => onOpenChange(false)} />}

      <div
        className="fixed inset-y-0 right-0 z-50 w-[480px] max-w-full bg-background shadow-2xl border-l border-border flex flex-col"
        style={{
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms ease-in-out',
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-base font-semibold text-foreground">New {entity.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fill in the fields below to create a new {entity.name.toLowerCase()}.
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Close"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <line x1="3" y1="3" x2="13" y2="13" />
              <line x1="13" y1="3" x2="3" y2="13" />
            </svg>
          </button>
        </div>

        {/* Conditional mount: remounting resets the form for free — no useEffect needed */}
        {open && <EntityCreateFormContent entity={entity} onOpenChange={onOpenChange} />}
      </div>
    </>
  );
}
