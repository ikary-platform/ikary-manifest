import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ContractsSection } from './sections/ContractsSection';
import { ApiRuntimeSection } from './sections/ApiRuntimeSection';
import { UIRuntimeSection } from './sections/UIRuntimeSection';

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const TABS = ['Contracts', 'API Runtime', 'UI Runtime'] as const;
type Tab = (typeof TABS)[number];

export function App() {
  const [tab, setTab] = useState<Tab>('Contracts');

  return (
    <QueryClientProvider client={qc}>
      <div className="flex h-screen flex-col font-sans bg-white text-gray-900">
        <header className="flex shrink-0 items-end border-b border-gray-200 px-4 gap-1 pt-2">
          <div className="flex items-center gap-2 mr-4 pb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Cell Runtime Playground
            </span>
          </div>
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-t transition-colors border-b-2 ${
                tab === t
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {t}
            </button>
          ))}
        </header>
        <main className="flex-1 overflow-hidden">
          {tab === 'Contracts' && <ContractsSection />}
          {tab === 'API Runtime' && <ApiRuntimeSection />}
          {tab === 'UI Runtime' && <UIRuntimeSection />}
        </main>
      </div>
    </QueryClientProvider>
  );
}
