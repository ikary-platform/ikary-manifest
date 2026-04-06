import { useMemo } from 'react';
import type { ComponentType, ReactNode } from 'react';
import {
  MemoryRouter,
  Routes,
  Route,
  Navigate,
  UNSAFE_LocationContext,
  UNSAFE_NavigationContext,
  UNSAFE_RouteContext,
} from 'react-router-dom';
import type { CellManifestV1 } from '@ikary-manifest/contract';
import { ShellLayout } from './shell-layout';
import { PageRenderer } from './page-renderer';
import { CellRuntimeContext } from '../context/cell-runtime-context';
import { defaultCellComponentRegistry } from '../registry/default-registry';
import { createMockDataProvider } from '../providers/mock-data-provider';
import { useCreateCellDataStore } from '../store/use-cell-data-store';
import { useCreateApiDataStore } from '../store/use-api-data-store';
import type { EntityApiAdapter } from '../store/entity-api-adapter';
import type { CellComponentRegistry } from '../registry/cell-component-registry';
import { getManifestRoutes, resolveLandingPath } from '../manifest/selectors';
import { CELL_RUNTIME_CSS } from '../__cell-styles';

export type CellDataMode = 'mock' | 'live';

export interface CellApiConfig {
  apiBase: string;
  getToken: () => string | null;
  tenantId: string;
  workspaceId: string;
}

/**
 * Optional wrapper component type for the API provider.
 *
 * In enterprise deployments (live mode) pass the CellApiProvider from
 * @ikary/cell-runtime-api/ui here. In open-source / mock mode this prop
 * is not needed and the inner tree is rendered unwrapped.
 */
export type CellApiProviderComponent = ComponentType<{ children: ReactNode }>;

interface CellAppRendererProps {
  manifest: CellManifestV1;
  registry?: CellComponentRegistry;
  dataMode?: CellDataMode;
  apiConfig?: CellApiConfig;
  /**
   * Optional API provider wrapper.  Supply when dataMode is 'live'.
   * When not provided (default mock mode) the renderer works without it.
   */
  CellApiProvider?: CellApiProviderComponent;
  /**
   * Optional adapter that provides live entity data operations.
   * Required when dataMode is 'live'.  When not supplied the renderer
   * falls back to the in-memory mock store.
   *
   * In enterprise deployments supply the adapter from
   * @ikary/cell-runtime-api/ui (e.g. via useEntityBridgeAdapter).
   */
  apiAdapter?: EntityApiAdapter;
}

/** A no-op EntityApiAdapter used as a placeholder when no real adapter is provided. */
const NULL_ADAPTER: EntityApiAdapter = {
  listData: { data: [] },
  listLoading: false,
  detailData: null,
  auditData: undefined,
  createAsync: () => Promise.resolve({ data: {} }),
  updateAsync: () => Promise.resolve(undefined),
  deleteAsync: () => Promise.resolve(),
  rollbackAsync: () => Promise.resolve(),
  setActiveEntity: () => undefined,
  setActiveRecord: () => undefined,
};

function CellAppRendererInner({
  manifest,
  registry,
  dataMode,
  apiAdapter,
}: Required<Pick<CellAppRendererProps, 'manifest' | 'registry'>> & {
  dataMode: CellDataMode;
  apiAdapter?: EntityApiAdapter;
}) {
  const routes = useMemo(() => getManifestRoutes(manifest), [manifest]);
  const landingPath = useMemo(() => resolveLandingPath(manifest), [manifest]);

  const mockStore = useCreateCellDataStore(manifest);
  const apiStore = useCreateApiDataStore(manifest, apiAdapter ?? NULL_ADAPTER);

  const dataStore = dataMode === 'live' && apiAdapter ? apiStore : mockStore;

  return (
    <CellRuntimeContext.Provider
      value={{
        manifest,
        registry,
        mockDataProvider: createMockDataProvider(),
        dataStore,
        dataMode,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: CELL_RUNTIME_CSS }} />
      <UNSAFE_RouteContext.Provider value={{ outlet: null, matches: [], isDataRoute: false }}>
        <UNSAFE_LocationContext.Provider value={null as any}>
          <UNSAFE_NavigationContext.Provider value={null as any}>
            <MemoryRouter initialEntries={[landingPath]}>
              <Routes>
                <Route element={<ShellLayout manifest={manifest} />}>
                  {routes.map((route) => (
                    <Route key={route.pageKey} path={route.path} element={<PageRenderer page={route.page} />} />
                  ))}
                  <Route path="*" element={<Navigate to={landingPath} replace />} />
                </Route>
              </Routes>
            </MemoryRouter>
          </UNSAFE_NavigationContext.Provider>
        </UNSAFE_LocationContext.Provider>
      </UNSAFE_RouteContext.Provider>
    </CellRuntimeContext.Provider>
  );
}

/** No-op passthrough used when no CellApiProvider is supplied. */
function PassthroughProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function CellAppRenderer({
  manifest,
  registry = defaultCellComponentRegistry,
  dataMode = 'mock',
  CellApiProvider,
  apiAdapter,
}: CellAppRendererProps) {
  // When no CellApiProvider is supplied fall back to a passthrough wrapper.
  // This keeps the tree structure stable regardless of dataMode.
  const Provider = CellApiProvider ?? PassthroughProvider;

  return (
    <Provider>
      <CellAppRendererInner manifest={manifest} registry={registry} dataMode={dataMode} apiAdapter={apiAdapter} />
    </Provider>
  );
}
