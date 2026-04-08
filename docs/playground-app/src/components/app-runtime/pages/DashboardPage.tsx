import type { PageDefinition } from '@ikary/contract';
import { useAppRuntime } from '../AppRuntimeContext';

export function DashboardPage({ page }: { page: PageDefinition }) {
  const { manifest, stores } = useAppRuntime();
  const entities = manifest.spec.entities ?? [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {page.title}
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {manifest.metadata.description ?? 'Welcome to your application preview.'}
        </p>
      </div>

      {entities.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {entities.map((entity) => {
            const store = stores.get(entity.key);
            const count = store?.getRecordCount() ?? 0;
            return (
              <div
                key={entity.key}
                className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800/30"
              >
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{count}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {entity.pluralName ?? entity.name}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
