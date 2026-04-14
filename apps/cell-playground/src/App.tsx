import { useState } from 'react';
import { PanelLeft } from 'lucide-react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ContractsSection } from './sections/ContractsSection';
import { ApiRuntimeSection } from './sections/ApiRuntimeSection';
import { UIRuntimeSection } from './sections/UIRuntimeSection';
import { AppRuntimeSection } from './sections/AppRuntimeSection';
import { ManifestsSidebarList } from './components/sidebar/ManifestsSidebarList';
import { EntitiesSidebarList } from './components/sidebar/EntitiesSidebarList';
import { UiRuntimeSidebar } from './components/sidebar/UiRuntimeSidebar';
import { SchemaSidebarNav } from './components/sidebar/SchemaSidebarNav';
import { ExternalLinkIcon, SunIcon, MoonIcon, GitHubIcon } from './components/icons';
import { useDarkMode } from './hooks/useDarkMode';
import type { AppManifestScenario } from './data/app-manifest-loader';
import type { ApiEntityScenario } from './data/api-sample-entities';

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const TABS = [
  { label: 'App Runtime', path: '/app-runtime' },
  { label: 'API Runtime', path: '/api-runtime' },
  { label: 'UI Runtime', path: '/ui-runtime' },
  { label: 'Schema', path: '/contracts' },
] as const;

export function App() {
  const { dark, toggle } = useDarkMode();
  const location = useLocation();
  const navigate = useNavigate();

  // Lifted state for AppRuntime sidebar
  const [appActiveScenario, setAppActiveScenario] = useState(0);
  const [appCollapsedCats, setAppCollapsedCats] = useState<Set<AppManifestScenario['category']>>(new Set());

  // Lifted state for ApiRuntime sidebar
  const [apiActiveScenario, setApiActiveScenario] = useState(0);
  const [apiCollapsedCats, setApiCollapsedCats] = useState<Set<ApiEntityScenario['category']>>(new Set());

  // Global sidebar collapsed state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <QueryClientProvider client={qc}>
      {/* Root: flex-row so sidebar spans full browser height */}
      <div
        className="flex h-screen text-[#071230] dark:text-[#f8fafc] bg-white dark:bg-[#081022]"
        style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif" }}
      >

        {/* ── LEFT GLOBAL SIDEBAR — full browser height ── */}
        <div
          className="shrink-0 overflow-hidden flex flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--background))] z-10"
          style={{
            width: sidebarCollapsed ? '0' : '220px',
            transition: 'width 0.2s ease',
          }}
        >
          {/* Logo area — same height as the nav bar on the right */}
          <div className="h-12 flex items-center px-4 border-b border-[hsl(var(--border))] shrink-0">
            <a href="https://documentation.ikary.co/" target="_blank" rel="noreferrer">
              <img src="/brand/original-full.svg" alt="IKARY" className="h-[18px] w-auto block dark:hidden" />
              <img src="/brand/white-full.svg" alt="IKARY" className="h-[18px] w-auto hidden dark:block" />
            </a>
          </div>

          {/* Route-specific label */}
          <div className="ide-toolbar border-l-0 pl-3">
            <span className="ide-toolbar-label text-[11px] font-semibold tracking-[0.06em] uppercase">
              {location.pathname.startsWith('/app-runtime') && 'Manifests'}
              {location.pathname.startsWith('/api-runtime') && 'Entities'}
              {location.pathname.startsWith('/ui-runtime') && 'Primitives'}
              {location.pathname.startsWith('/contracts') && 'Schema'}
            </span>
          </div>

          {/* Route-specific list */}
          {location.pathname.startsWith('/app-runtime') && (
            <ManifestsSidebarList
              activeScenario={appActiveScenario}
              onSelect={setAppActiveScenario}
              collapsedCategories={appCollapsedCats}
              onToggleCategory={(cat) =>
                setAppCollapsedCats((prev) => {
                  const n = new Set(prev);
                  n.has(cat) ? n.delete(cat) : n.add(cat);
                  return n;
                })
              }
            />
          )}
          {location.pathname.startsWith('/api-runtime') && (
            <EntitiesSidebarList
              activeScenario={apiActiveScenario}
              onSelect={setApiActiveScenario}
              collapsedCategories={apiCollapsedCats}
              onToggleCategory={(cat) =>
                setApiCollapsedCats((prev) => {
                  const n = new Set(prev);
                  n.has(cat) ? n.delete(cat) : n.add(cat);
                  return n;
                })
              }
            />
          )}
          {location.pathname.startsWith('/ui-runtime') && <UiRuntimeSidebar />}
          {location.pathname.startsWith('/contracts') && <SchemaSidebarNav />}
        </div>

        {/* ── RIGHT COLUMN: nav on top, content below ── */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">

          {/* Top nav bar — same 48px height as sidebar logo area */}
          <header className="ikary-nav shrink-0 z-10 h-12">
            <div className="flex items-center h-full px-6 gap-2 max-w-none">

              {/* Sidebar toggle — classic panel button, left of first tab */}
              <button
                onClick={() => setSidebarCollapsed((c) => !c)}
                aria-label={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
                title={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
                className="w-8 h-8 flex items-center justify-center rounded-md mr-1 text-[#62708c] dark:text-[#bcc8df] hover:bg-black/5 dark:hover:bg-white/8 transition-colors"
              >
                <PanelLeft size={18} strokeWidth={1.8} />
              </button>

              <nav className="flex items-center h-full mr-auto" aria-label="Playground sections">
                {TABS.map((t) => (
                  <button
                    key={t.path}
                    onClick={() => navigate(t.path)}
                    className={[
                      'px-3 h-full flex items-center text-sm font-medium transition-colors outline-none',
                      location.pathname.startsWith(t.path)
                        ? 'text-[#1d4ed8] dark:text-[#78afff]'
                        : 'text-[#62708c] dark:text-[#bcc8df] hover:text-[#1d4ed8] dark:hover:text-[#78afff]',
                    ].join(' ')}
                  >
                    {t.label}
                  </button>
                ))}
              </nav>

              <div className="flex items-center h-full ml-2 gap-0">
                <a
                  href="https://documentation.ikary.co/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 h-full flex items-center gap-1 text-sm font-medium text-[#62708c] dark:text-[#bcc8df] hover:text-[#1d4ed8] dark:hover:text-[#78afff] transition-colors"
                >
                  Back to documentation
                  <ExternalLinkIcon />
                </a>
                <a
                  href="https://ikary.co"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 h-full flex items-center gap-1 text-sm font-medium text-[#62708c] dark:text-[#bcc8df] hover:text-[#1d4ed8] dark:hover:text-[#78afff] transition-colors"
                >
                  ikary.co
                  <ExternalLinkIcon />
                </a>
              </div>

              <div className="flex items-center gap-1 ml-1">
                <button
                  onClick={toggle}
                  aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                  className="w-9 h-9 flex items-center justify-center rounded-md text-[#62708c] dark:text-[#bcc8df] hover:bg-black/5 dark:hover:bg-white/8 transition-colors"
                >
                  {dark ? <SunIcon /> : <MoonIcon />}
                </button>
                <a
                  href="https://github.com/ikary-platform/ikary-manifest"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub repository"
                  className="w-9 h-9 flex items-center justify-center rounded-md text-[#62708c] dark:text-[#bcc8df] hover:bg-black/5 dark:hover:bg-white/8 transition-colors"
                >
                  <GitHubIcon />
                </a>
              </div>
            </div>
          </header>

          {/* Section content */}
          <main className="flex-1 overflow-hidden">
            <Routes>
              <Route
                path="/app-runtime"
                element={
                  <AppRuntimeSection activeScenario={appActiveScenario} />
                }
              />
              <Route path="/contracts" element={<ContractsSection />} />
              <Route path="/schema" element={<Navigate to="/contracts" replace />} />
              <Route
                path="/api-runtime"
                element={
                  <ApiRuntimeSection activeScenario={apiActiveScenario} />
                }
              />
              <Route path="/ui-runtime" element={<UIRuntimeSection />} />
              <Route path="*" element={<Navigate to="/app-runtime" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}

