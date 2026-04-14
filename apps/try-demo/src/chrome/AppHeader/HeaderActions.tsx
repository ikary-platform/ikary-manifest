import { ThemeToggle } from '@ikary/cell-primitives';
import { EXTERNAL_LINKS } from '../../config/links';
import { RunLocallyButton } from './RunLocallyButton';

interface Props {
  canRunLocally: boolean;
  onRunLocally: () => void;
  onOpenBranding: () => void;
}

export function HeaderActions({ canRunLocally, onRunLocally, onOpenBranding }: Props) {
  return (
    <div className="app-header-right">
      <button
        type="button"
        className="header-link"
        onClick={onOpenBranding}
        aria-label="Open branding settings"
      >
        Brand
      </button>
      <RunLocallyButton disabled={!canRunLocally} onClick={onRunLocally} />
      <a className="header-link" href={EXTERNAL_LINKS.github} target="_blank" rel="noreferrer">
        ⭐ GitHub
      </a>
      <a
        className="header-link header-link-accent"
        href={EXTERNAL_LINKS.product}
        target="_blank"
        rel="noreferrer"
      >
        ikary.co →
      </a>
      <ThemeToggle />
    </div>
  );
}
