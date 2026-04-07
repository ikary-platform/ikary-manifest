import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ContractsSection } from './sections/ContractsSection';
import { ApiRuntimeSection } from './sections/ApiRuntimeSection';
import { UIRuntimeSection } from './sections/UIRuntimeSection';

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const TABS = ['Contracts', 'API Runtime', 'UI Runtime'] as const;
type Tab = (typeof TABS)[number];

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
  const [tab, setTab] = useState<Tab>('Contracts');
  const { dark, toggle } = useDarkMode();

  return (
    <QueryClientProvider client={qc}>
      <div
        className="flex h-screen flex-col text-[#071230] dark:text-[#f8fafc] bg-white dark:bg-[#081022]"
        style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif" }}
      >
        {/* ── Nav bar — 64 px, same as VitePress --vp-nav-height ── */}
        <header className="ikary-nav shrink-0 h-16 z-10">
          <div className="flex items-center h-full px-6 gap-2 max-w-none">

            {/* Logo — light / dark variants, height mirrors .VPNavBarTitle .logo */}
            <a
              href="https://ikary-platform.github.io/ikary-manifest/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center shrink-0 mr-4"
            >
              <img
                src="/ikary-manifest/brand/original-full.svg"
                alt="IKARY Manifest"
                className="h-[22px] sm:h-[26px] w-auto block dark:hidden"
              />
              <img
                src="/ikary-manifest/brand/white-full.svg"
                alt="IKARY Manifest"
                className="h-[22px] sm:h-[26px] w-auto hidden dark:block"
              />
            </a>

            {/* Push tabs + actions to the right */}
            <div className="flex-1" />

            {/* Tab nav — styled as VitePress nav links */}
            <nav className="flex items-center h-full" aria-label="Playground sections">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={[
                    'px-3 h-full flex items-center text-sm font-medium transition-colors outline-none',
                    tab === t
                      ? 'text-[#1d4ed8] dark:text-[#78afff]'
                      : 'text-[#62708c] dark:text-[#bcc8df] hover:text-[#1d4ed8] dark:hover:text-[#78afff]',
                  ].join(' ')}
                >
                  {t}
                </button>
              ))}
            </nav>

            {/* Theme toggle + GitHub — mirroring VitePress nav social / appearance area */}
            <div className="flex items-center gap-1 ml-3">
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

        {/* ── Content ── */}
        <main className="flex-1 overflow-hidden">
          {tab === 'Contracts' && <ContractsSection />}
          {tab === 'API Runtime' && <ApiRuntimeSection />}
          {tab === 'UI Runtime' && <UIRuntimeSection />}
        </main>
      </div>
    </QueryClientProvider>
  );
}

/* ── Icons — inline SVG so no extra dependency ── */

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
