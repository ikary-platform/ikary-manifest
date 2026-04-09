import type { ReactNode } from 'react';

export type PageHeaderActionIntent = 'default' | 'neutral' | 'danger';

export type PageHeaderMetaTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export type PageHeaderLowerSlotType = 'tabs' | 'summary-strip' | 'sub-navigation' | 'helper-content';

export type PageHeaderBreadcrumb = {
  key: string;
  label: string;
  href?: string;
};

export type PageHeaderMetaItem =
  | {
      type: 'text';
      key: string;
      label: string;
    }
  | {
      type: 'badge';
      key: string;
      label: string;
      tone?: PageHeaderMetaTone;
    };

export type PageHeaderResolvedAction = {
  key: string;
  label: string;
  icon?: string;
  intent?: PageHeaderActionIntent;
  href?: string;
  disabled?: boolean;
  hidden?: boolean;
  onClick?: () => void;
};

export type PageHeaderLowerSlot = {
  type: PageHeaderLowerSlotType;
  content?: ReactNode;
};

export type PageHeaderViewProps = {
  title: string;
  description?: string;
  eyebrow?: string;

  breadcrumbs?: PageHeaderBreadcrumb[];
  meta?: PageHeaderMetaItem[];

  primaryAction?: PageHeaderResolvedAction;
  secondaryActions?: PageHeaderResolvedAction[];

  lowerSlot?: PageHeaderLowerSlot;

  dense?: boolean;
};
