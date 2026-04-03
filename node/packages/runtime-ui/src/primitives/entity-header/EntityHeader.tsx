import type { RenderedAction, ActionDefinition } from '../../types/ActionTypes';

interface EntityHeaderProps {
  title?: string;
  subtitle?: string;
  status?: { label: string };
  actions?: RenderedAction[];
  onAction?: (action: ActionDefinition) => void;
}

export function EntityHeader({ title, subtitle, status, actions, onAction }: EntityHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title ?? 'Untitled'}</h2>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2 shrink-0 mt-0.5">
        {status?.label && (
          <span className="inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
            {status.label}
          </span>
        )}
        {onAction &&
          actions?.map((a, i) => (
            <button
              key={i}
              onClick={() => onAction(a.action)}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              {a.label}
            </button>
          ))}
      </div>
    </div>
  );
}
