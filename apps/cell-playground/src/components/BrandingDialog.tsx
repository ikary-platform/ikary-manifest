import { useEffect } from 'react';
import { BrandingAdminPanel } from '@ikary/cell-branding/ui';

export const PLAYGROUND_BRANDING_CELL_ID = 'playground';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function BrandingDialog({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Branding settings"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-3">
          <h2 className="text-sm font-semibold">Branding</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="h-8 w-8 rounded-md text-[#62708c] hover:bg-black/5 dark:text-[#bcc8df] dark:hover:bg-white/10"
          >
            ×
          </button>
        </div>
        <div className="p-4">
          <p className="mb-3 text-xs text-[#62708c] dark:text-[#bcc8df]">
            Changes persist in localStorage under
            <code className="ml-1 rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">
              ikary.playground.branding.{PLAYGROUND_BRANDING_CELL_ID}
            </code>
            . Open any runtime tab to see the theme variables take effect.
          </p>
          <BrandingAdminPanel cellId={PLAYGROUND_BRANDING_CELL_ID} />
        </div>
      </div>
    </div>
  );
}
