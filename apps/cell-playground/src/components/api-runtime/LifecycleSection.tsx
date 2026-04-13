import type { LifecycleDefinition } from '@ikary/cell-contract';

export function LifecycleSection({ lifecycle }: { lifecycle: LifecycleDefinition }) {
  if (!lifecycle) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Lifecycle</h3>

      {/* State pills */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          States
        </p>
        <div className="flex flex-wrap gap-2">
          {lifecycle.states.map((state) => (
            <span
              key={state}
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                state === lifecycle.initial
                  ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-400 dark:bg-blue-900 dark:text-blue-200 dark:ring-blue-500'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {state}
              {state === lifecycle.initial && (
                <span className="ml-1 text-[9px] opacity-70">(initial)</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Transitions */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Transitions
        </p>
        <div className="space-y-2">
          {lifecycle.transitions.map((t) => (
            <div
              key={t.key}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 font-medium">
                  {t.from}
                </span>
                <span className="text-gray-400 dark:text-gray-500 text-sm select-none">&rarr;</span>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
                  {t.label ?? t.key}
                </span>
                <span className="text-gray-400 dark:text-gray-500 text-sm select-none">&rarr;</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 font-medium">
                  {t.to}
                </span>
              </div>

              {/* Guards and hooks */}
              {((t.guards && t.guards.length > 0) || (t.hooks && t.hooks.length > 0)) && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {t.guards?.map((g) => (
                    <span
                      key={g}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300"
                    >
                      guard: {g}
                    </span>
                  ))}
                  {t.hooks?.map((h) => (
                    <span
                      key={h}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300"
                    >
                      hook: {h}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
