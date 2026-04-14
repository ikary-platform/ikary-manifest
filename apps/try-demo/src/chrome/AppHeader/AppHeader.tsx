import type { StreamState } from '../../stream/stream-state';
import { HeaderMeta } from '../HeaderMeta';
import { HeaderActions } from './HeaderActions';
import { HeaderLogo } from './HeaderLogo';

interface Props {
  streamState: StreamState;
  onRunLocally: () => void;
  onOpenBranding: () => void;
}

export function AppHeader({ streamState, onRunLocally, onOpenBranding }: Props) {
  return (
    <header className="app-header">
      <div className="app-header-left">
        <HeaderLogo />
        <HeaderMeta state={streamState} />
      </div>
      <HeaderActions
        canRunLocally={streamState.manifest != null}
        onRunLocally={onRunLocally}
        onOpenBranding={onOpenBranding}
      />
    </header>
  );
}
