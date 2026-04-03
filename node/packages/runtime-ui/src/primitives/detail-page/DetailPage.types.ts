import type { ReactNode } from 'react';
import type { RenderState } from '../../runtime/render-state.types';

export type DetailPageTabKind = 'overview' | 'domain' | 'history' | 'audit';

export type DetailPageMetadataKey = 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'version' | 'status';

export type DetailPageActionVariant = 'default' | 'secondary' | 'destructive';

export type DetailPageTabView = {
  key: string;
  label: string;
  href: string;
  disabled?: boolean;
  kind?: DetailPageTabKind;
};

export type DetailPageMetadataItemView = {
  key: DetailPageMetadataKey;
  label: string;
  value: string;
};

export type DetailPageResolvedAction = {
  key: string;
  label: string;
  icon?: string;
  href?: string;
  disabled?: boolean;
  variant: DetailPageActionVariant;
  onClick?: () => void;
};

export type DetailPagePageRenderState = Extract<RenderState, { kind: 'loading' | 'error' }>;

export type DetailPageViewProps = {
  title: string;
  metadata: DetailPageMetadataItemView[];
  actions: DetailPageResolvedAction[];
  tabs: DetailPageTabView[];
  activeTabKey: string;
  overviewEditable: boolean;
  isEditing: boolean;
  contentKey: string;
  content?: ReactNode;
  renderState?: DetailPagePageRenderState;
};
