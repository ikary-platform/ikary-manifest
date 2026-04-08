import { Outlet } from 'react-router-dom';
import type { CellManifestV1 } from '@ikary/contract';
import { ShellHeader } from './shell-header';
import { SidebarNav } from './sidebar-nav';
import { getManifestNavigation } from '../manifest/selectors';

interface ShellLayoutProps {
  manifest: CellManifestV1;
}

export function ShellLayout({ manifest }: ShellLayoutProps) {
  const title = manifest.spec.mount.title ?? manifest.metadata.name;
  const navigation = getManifestNavigation(manifest);

  return (
    <div className="flex flex-col h-full" style={{ transform: 'translateZ(0)' }}>
      <ShellHeader title={title} />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-52 shrink-0 border-r bg-background overflow-y-auto">
          <SidebarNav items={navigation} />
        </aside>
        <main className="flex-1 flex flex-col overflow-y-auto bg-muted/30">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
