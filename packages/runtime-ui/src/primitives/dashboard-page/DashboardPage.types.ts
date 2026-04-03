import type { ReactNode } from 'react';
import type { RenderState } from '../../runtime/render-state.types';

export type DashboardPageVariant = 'workspace' | 'cell' | 'domain' | 'entity-overview';

export type DashboardPageDensity = 'comfortable' | 'compact';

export type DashboardPageActionVariant = 'default' | 'secondary' | 'destructive';

export type DashboardWidgetSize = 'small' | 'medium' | 'large';

export type DashboardPageResolvedAction = {
  key: string;
  label: string;
  icon?: string;
  href?: string;
  disabled?: boolean;
  variant: DashboardPageActionVariant;
  onClick?: () => void;
};

export type DashboardWidgetResolvedAction = {
  key: string;
  label: string;
  icon?: string;
  href?: string;
  disabled?: boolean;
  onClick?: () => void;
};

export type DashboardWidgetPrimitiveNode = {
  primitive: string;
  props?: unknown;
  runtime?: unknown;
};

export type DashboardWidgetContent = ReactNode | DashboardWidgetPrimitiveNode | Record<string, unknown>;

export type DashboardWidgetView = {
  key: string;
  title: string;
  subtitle?: string;
  size: DashboardWidgetSize;
  rendererKey: string;
  actions: DashboardWidgetResolvedAction[];
  renderState?: RenderState;
  content?: DashboardWidgetContent;
};

export type DashboardPageViewProps = {
  variant: DashboardPageVariant;
  density: DashboardPageDensity;
  title: string;
  subtitle?: string;
  actions: DashboardPageResolvedAction[];
  kpis: DashboardWidgetView[];
  primaryWidgets: DashboardWidgetView[];
  secondaryWidgets: DashboardWidgetView[];
  renderState?: RenderState;
};
