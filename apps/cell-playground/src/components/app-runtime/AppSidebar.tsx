import { useAppRuntime } from './AppRuntimeContext';
import type { NavItem } from './manifest-helpers';

interface AppSidebarProps {
  title: string;
  items: NavItem[];
}

export function AppSidebar({ title, items }: AppSidebarProps) {
  return (
    <aside className="w-52 shrink-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col h-full overflow-y-auto">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate block">
          {title}
        </span>
      </div>
      <nav className="flex-1 px-2 py-2 space-y-0.5">
        {items.map((item) => (
          <NavItemComponent key={item.key} item={item} />
        ))}
      </nav>
    </aside>
  );
}

function NavItemComponent({ item }: { item: NavItem }) {
  const { currentPath, navigate } = useAppRuntime();

  if (item.type === 'group') {
    return (
      <div className="pt-3 first:pt-0">
        <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {item.label}
        </span>
        <div className="mt-1 space-y-0.5">
          {item.children.map((child) => (
            <NavItemComponent key={child.key} item={child} />
          ))}
        </div>
      </div>
    );
  }

  const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');

  return (
    <button
      onClick={() => navigate(item.path)}
      className={[
        'block w-full text-left px-2 py-1.5 rounded text-xs transition-colors truncate',
        isActive
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200',
      ].join(' ')}
    >
      {item.label}
    </button>
  );
}
