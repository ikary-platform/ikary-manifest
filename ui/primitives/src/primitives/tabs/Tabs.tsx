import { Link, useNavigate } from 'react-router-dom';
import type { TabsResolvedItem, TabsViewProps } from './Tabs.types';

export function Tabs({ items = [], activeKey, overflowMode = 'scroll', collapseBelow, dense = false }: TabsViewProps) {
  const navigate = useNavigate();
  const visibleItems = items.filter((item) => !item.hidden);

  if (visibleItems.length === 0) {
    return null;
  }

  const showCompactMenu = overflowMode === 'menu' && Boolean(collapseBelow);

  return (
    <nav aria-label="Section navigation" className="w-full">
      <div className="space-y-2">
        <div className={mainTabsVisibilityClass(showCompactMenu, collapseBelow)}>
          <div className={overflowMode === 'scroll' ? 'overflow-x-auto' : 'overflow-hidden'}>
            <div
              className={[
                'flex min-w-max items-center gap-1 border-b border-gray-200 dark:border-gray-800',
                dense ? 'pb-1' : 'pb-1.5',
              ].join(' ')}
            >
              {visibleItems.map((item) => (
                <TabItemView key={item.key} item={item} active={item.key === activeKey} dense={dense} />
              ))}
            </div>
          </div>
        </div>

        {showCompactMenu && (
          <div className={compactMenuVisibilityClass(collapseBelow)}>
            <label className="sr-only" htmlFor="tabs-select-navigation">
              Select section
            </label>
            <select
              id="tabs-select-navigation"
              value={activeKey}
              onChange={(event) => {
                const selected = visibleItems.find((item) => item.key === event.target.value);
                if (!selected || selected.disabled) return;

                if (selected.href) {
                  navigate(selected.href);
                  return;
                }

                selected.onClick?.();
              }}
              className={[
                'w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
                'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200',
                dense ? 'h-8' : 'h-9',
              ].join(' ')}
            >
              {visibleItems.map((item) => (
                <option key={item.key} value={item.key} disabled={item.disabled}>
                  {item.label}
                  {typeof item.count === 'number' ? ` (${item.count})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </nav>
  );
}

function TabItemView({ item, active, dense }: { item: TabsResolvedItem; active: boolean; dense: boolean }) {
  const content = (
    <>
      <span className="truncate">{item.label}</span>
      {typeof item.count === 'number' && (
        <span
          className={[
            'inline-flex items-center rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold',
            'text-gray-700 dark:bg-gray-800 dark:text-gray-300',
            active ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : '',
          ].join(' ')}
        >
          {item.count}
        </span>
      )}
    </>
  );

  const className = tabClassName({ active, dense, disabled: item.disabled });

  if (item.href) {
    if (item.disabled) {
      return (
        <span aria-disabled="true" className={className}>
          {content}
        </span>
      );
    }

    return (
      <Link to={item.href} className={className} aria-current={active ? 'page' : undefined}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={item.onClick}
      disabled={item.disabled}
      aria-current={active ? 'page' : undefined}
      className={className}
    >
      {content}
    </button>
  );
}

function tabClassName({ active, dense, disabled }: { active: boolean; dense: boolean; disabled?: boolean }): string {
  return [
    'inline-flex max-w-full items-center gap-2 rounded-t-md border-b-2 px-3 text-sm font-medium',
    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
    dense ? 'h-8 text-xs' : 'h-9 text-sm',
    active
      ? 'border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-300'
      : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
    disabled ? 'cursor-not-allowed opacity-50' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

function mainTabsVisibilityClass(useCompactMenu: boolean, breakpoint?: TabsViewProps['collapseBelow']): string {
  if (!useCompactMenu) return 'block';

  switch (breakpoint) {
    case 'sm':
      return 'hidden sm:block';
    case 'md':
      return 'hidden md:block';
    case 'lg':
      return 'hidden lg:block';
    default:
      return 'block';
  }
}

function compactMenuVisibilityClass(breakpoint?: TabsViewProps['collapseBelow']): string {
  switch (breakpoint) {
    case 'sm':
      return 'block sm:hidden';
    case 'md':
      return 'block md:hidden';
    case 'lg':
      return 'block lg:hidden';
    default:
      return 'block';
  }
}
