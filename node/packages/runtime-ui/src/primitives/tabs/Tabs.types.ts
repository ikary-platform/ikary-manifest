export type TabsOverflowMode = 'scroll' | 'menu';

export type TabsResponsiveBreakpoint = 'sm' | 'md' | 'lg';

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

  dense?: boolean;
};
