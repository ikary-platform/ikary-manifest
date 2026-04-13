export type TabsOverflowMode = 'scroll' | 'menu';

export type TabsResponsiveBreakpoint = 'sm' | 'md' | 'lg';

export type TabsVariant = 'line' | 'pill';

export type TabsResolvedItem = {
  key: string;
  label: string;
  href?: string;
  onClick?: () => void;
  count?: number;
  disabled?: boolean;
  hidden?: boolean;
};

export type TabsViewProps = {
  items: TabsResolvedItem[];
  activeKey?: string;

  overflowMode?: TabsOverflowMode;
  collapseBelow?: TabsResponsiveBreakpoint;

  variant?: TabsVariant;
  dense?: boolean;
};
