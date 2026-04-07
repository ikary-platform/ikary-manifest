import { useLocation, useNavigate } from 'react-router-dom';
import type { DetailPageTab as DetailPageTabPresentation } from '@ikary/presentation';

type DetailTabKind = NonNullable<DetailPageTabPresentation['kind']>;

export interface DetailTabDef {
  key: string;
  label: string;
  kind: DetailTabKind;
  suffix: string;
}

interface DetailTabsProps {
  tabs: DetailTabDef[];
  basePath: string;
}

export function DetailTabs({ tabs, basePath }: DetailTabsProps) {
  const location = useLocation();
  const navigate = useNavigate();

  function getActiveKey(): string {
    const path = location.pathname;
    for (const tab of tabs) {
      if (tab.suffix && path.endsWith(`/${tab.suffix}`)) return tab.key;
    }
    return tabs[0]?.key ?? 'overview';
  }

  function navigateTo(tab: DetailTabDef) {
    const target = tab.suffix ? `${basePath}/${tab.suffix}` : basePath;
    navigate(target);
  }

  const activeKey = getActiveKey();

  return (
    <div className="flex border-b border-border bg-background px-6 shrink-0">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => navigateTo(tab)}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 mr-1 -mb-px transition-colors ${
            activeKey === tab.key
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
