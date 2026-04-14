import { BrandingAdminPanel } from '@ikary/cell-branding/ui';
import { TRY_DEMO_BRANDING_CELL_ID } from '../../main';

interface Props {
  onClose: () => void;
}

export function BrandingPanel({ onClose }: Props) {
  return (
    <>
      <div className="slide-overlay" onClick={onClose} />
      <aside className="slide-panel" role="dialog" aria-label="Branding">
        <header className="slide-header">
          <div className="slide-title">Branding</div>
          <button type="button" className="slide-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="slide-body">
          <p className="text-sm opacity-70 mb-3">
            Changes persist in your browser only. Reload to see the effect; refresh this page to
            see defaults return.
          </p>
          <BrandingAdminPanel cellId={TRY_DEMO_BRANDING_CELL_ID} />
        </div>
      </aside>
    </>
  );
}
