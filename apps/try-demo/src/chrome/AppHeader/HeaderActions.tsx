import { ThemeToggle } from '@ikary/cell-primitives';
import { EXTERNAL_LINKS } from '../../config/links';
import { RunLocallyButton } from './RunLocallyButton';

interface Props {
  canRunLocally: boolean;
  onRunLocally: () => void;
}

export function HeaderActions({ canRunLocally, onRunLocally }: Props) {
  return (
    <div className="app-header-right">
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
