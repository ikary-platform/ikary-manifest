import { useAppRuntime } from './AppRuntimeContext';
import { AppSidebar } from './AppSidebar';
import {
  getManifestNavigation,
  getManifestRoutes,
} from './manifest-helpers';
import { EntityListPage } from './pages/EntityListPage';
import { EntityDetailPage } from './pages/EntityDetailPage';
import { EntityCreatePage } from './pages/EntityCreatePage';
import { DashboardPage } from './pages/DashboardPage';
import type { PageDefinition } from '@ikary/contract';

export function AppShell() {
  const { manifest, currentPath } = useAppRuntime();
  const navItems = getManifestNavigation(manifest);
  const routes = getManifestRoutes(manifest);
  const title = manifest.spec.mount.title ?? manifest.metadata.name ?? 'App';

  const matched = matchRoute(routes, currentPath);

  return (
    <div className="flex h-full">
      <AppSidebar title={title} items={navItems} />
      <main className="flex-1 overflow-y-auto bg-white dark:bg-[#0a1329]">
        {matched ? (
          <PageSwitch page={matched.page} params={matched.params} />
        ) : (
          <div className="p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No page matches path <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{currentPath}</code>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

interface MatchResult {
  page: PageDefinition;
  params: Record<string, string>;
}

function matchRoute(
  routes: ReturnType<typeof getManifestRoutes>,
  currentPath: string,
): MatchResult | null {
  // Sort routes: more specific (longer, no params) first
  const sorted = [...routes].sort((a, b) => {
    const aHasParam = a.path.includes(':');
    const bHasParam = b.path.includes(':');
    if (aHasParam !== bHasParam) return aHasParam ? 1 : -1;
    return b.path.length - a.path.length;
  });

  for (const route of sorted) {
    const params = matchPath(route.path, currentPath);
    if (params !== null) {
      return { page: route.page, params };
    }
  }
  return null;
}

function matchPath(
  pattern: string,
  path: string,
): Record<string, string> | null {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    const pp = patternParts[i];
    if (pp.startsWith(':')) {
      params[pp.slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (pp !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

function PageSwitch({ page, params }: { page: PageDefinition; params: Record<string, string> }) {
  switch (page.type) {
    case 'entity-list':
      return <EntityListPage page={page} />;
    case 'entity-detail':
      return <EntityDetailPage page={page} params={params} />;
    case 'entity-create':
      return <EntityCreatePage page={page} />;
    case 'entity-edit':
      return <EntityCreatePage page={page} />;
    case 'dashboard':
      return <DashboardPage page={page} />;
    default:
      return (
        <div className="p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page type <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{page.type}</code> is not yet supported in the preview.
          </p>
        </div>
      );
  }
}
