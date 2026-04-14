import { useState, useEffect } from 'react';
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
import type { AppManifestScenario } from './data/app-manifest-loader';
import type { ApiEntityScenario } from './data/api-sample-entities';

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const TABS = [
  { label: 'App Runtime', path: '/app-runtime' },
  { label: 'API Runtime', path: '/api-runtime' },
  { label: 'UI Runtime', path: '/ui-runtime' },
  { label: 'Schema', path: '/contracts' },
] as const;

// Read initial state from the class already applied by the inline <script> in
// index.html — avoids a flash of wrong theme on first render.
function useDarkMode() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try {
      localStorage.setItem('ikary-theme', dark ? 'dark' : 'light');
    } catch (_) {}
  }, [dark]);

  return { dark, toggle: () => setDark((d) => !d) };
}

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
          style={{
            width: sidebarCollapsed ? '0' : '220px',
            flexShrink: 0,
            overflow: 'hidden',
            transition: 'width 0.2s ease',
            borderRight: '1px solid hsl(var(--border))',
            display: 'flex',
            flexDirection: 'column',
            background: 'hsl(var(--background))',
            zIndex: 10,
          }}
        >
          {/* Logo area — same height as the nav bar on the right */}
          <div
            style={{
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              borderBottom: '1px solid hsl(var(--border))',
              flexShrink: 0,
            }}
          >
            <a href="https://documentation.ikary.co/" target="_blank" rel="noreferrer">
              <img src="/brand/original-full.svg" alt="IKARY" className="h-[18px] w-auto block dark:hidden" />
              <img src="/brand/white-full.svg" alt="IKARY" className="h-[18px] w-auto hidden dark:block" />
            </a>
          </div>

          {/* Route-specific label */}
          <div
            className="ide-toolbar"
            style={{ borderLeft: 'none', paddingLeft: '12px' }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
              className="ide-toolbar-label"
            >
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
          <header className="ikary-nav shrink-0 z-10" style={{ height: '48px' }}>
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

/* ── Icons — inline SVG so no extra dependency ── */

// Exact same icon VitePress uses for external nav links (Material Design "call_made")
function ExternalLinkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="inline-block opacity-70">
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M9 5v2h6.59L4 18.59 5.41 20 17 8.41V15h2V5H9z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="7.05" y2="7.05" />
      <line x1="16.95" y1="16.95" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="7.05" y2="16.95" />
      <line x1="16.95" y1="7.05" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
