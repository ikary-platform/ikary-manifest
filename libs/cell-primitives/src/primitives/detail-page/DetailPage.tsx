import { RenderStateBoundary } from '../../runtime/RenderStateBoundary';
import { PageHeader } from '../page-header';
import type { PageHeaderMetaItem, PageHeaderResolvedAction } from '../page-header/PageHeader.types';
import { Tabs } from '../tabs';
import type { DetailPageMetadataItemView, DetailPageResolvedAction, DetailPageViewProps } from './DetailPage.types';

export function DetailPage({
  title,
  metadata,
  actions = [],
  tabs,
  activeTabKey,
  overviewEditable,
  isEditing,
  contentKey,
  content,
  renderState,
}: DetailPageViewProps) {
  const headerMeta = metadata.map(toHeaderMetaItem);
  const { primaryAction, secondaryActions } = resolveHeaderActions(actions);

  const shell = (
    <article className="space-y-4 pb-2">
      <PageHeader
        title={title}
        meta={headerMeta}
        primaryAction={primaryAction}
        secondaryActions={secondaryActions}
        lowerSlot={
          overviewEditable && activeTabKey === 'overview'
            ? {
                type: 'helper-content',
                content: <OverviewModeBadge isEditing={isEditing} />,
              }
            : undefined
        }
      />

      <div className="px-4 sm:px-6">
        <Tabs
          items={tabs.map((tab) => ({
            key: tab.key,
            label: tab.label,
            href: tab.href,
            disabled: tab.disabled,
          }))}
          activeKey={activeTabKey}
        />
      </div>

      <section data-detail-page-content-key={contentKey} className="min-h-[120px] px-4 sm:px-6">
        {content}
      </section>
    </article>
  );

  return <RenderStateBoundary state={renderState}>{shell}</RenderStateBoundary>;
}

function toHeaderMetaItem(item: DetailPageMetadataItemView): PageHeaderMetaItem {
  return {
    type: 'text',
    key: item.key,
    label: `${item.label}: ${item.value}`,
  };
}

function resolveHeaderActions(actions: DetailPageResolvedAction[]): {
  primaryAction?: PageHeaderResolvedAction;
  secondaryActions: PageHeaderResolvedAction[];
} {
  if (actions.length === 0) {
    return {
      primaryAction: undefined,
      secondaryActions: [],
    };
  }

  const normalized = actions.map(toPageHeaderAction);
  const primaryIndex = normalized.findIndex((action) => action.intent !== 'neutral');

  if (primaryIndex === -1) {
    return {
      primaryAction: undefined,
      secondaryActions: normalized,
    };
  }

  return {
    primaryAction: normalized[primaryIndex],
    secondaryActions: normalized.filter((_, index) => index !== primaryIndex),
  };
}

function toPageHeaderAction(action: DetailPageResolvedAction): PageHeaderResolvedAction {
  return {
    key: action.key,
    label: action.label,
    icon: action.icon,
    href: action.href,
    disabled: action.disabled,
    onClick: action.onClick,
    intent: action.variant === 'destructive' ? 'danger' : action.variant === 'secondary' ? 'neutral' : 'default',
  };
}

function OverviewModeBadge({ isEditing }: { isEditing: boolean }) {
  const className = isEditing
    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';

  return (
    <span
      className={['inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium', className].join(' ')}
    >
      {isEditing ? 'Editing' : 'Read mode'}
    </span>
  );
}
