import { NavLink } from 'react-router-dom';
import type { ManifestNavigationItem } from '../manifest/selectors';

interface SidebarNavProps {
  items: ManifestNavigationItem[];
}

function NavItem({ item }: { item: ManifestNavigationItem }) {
  if (item.type === 'group') {
    return (
      <div className="mb-3">
        <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {item.label}
        </div>
        <div className="mt-1 space-y-0.5">
          {(item.children ?? []).map((child) => (
            <NavItem key={child.key} item={child} />
          ))}
        </div>
      </div>
    );
  }

  if (!item.path) return null;

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-1.5 text-sm rounded mx-1 ${
          isActive ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-muted'
        }`
      }
    >
      {item.label}
    </NavLink>
  );
}

export function SidebarNav({ items }: SidebarNavProps) {
  return (
    <nav className="py-3">
      {items.map((item) => (
        <NavItem key={item.key} item={item} />
      ))}
    </nav>
  );
}
