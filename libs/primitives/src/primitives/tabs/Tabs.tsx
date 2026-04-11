import * as RadixTabs from '@radix-ui/react-tabs';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import type { TabsResolvedItem, TabsVariant, TabsViewProps } from './Tabs.types';

export function Tabs({
  items = [],
  activeKey,
  overflowMode = 'scroll',
  variant = 'line',
  dense = false,
}: TabsViewProps) {
  const visibleItems = items.filter((item) => !item.hidden);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <RadixTabs.Root value={activeKey ?? ''} activationMode="manual" className="w-full">
      <div className={overflowMode === 'scroll' ? 'overflow-x-auto' : 'overflow-hidden'}>
        <RadixTabs.List className={listCn(variant, dense)} aria-label="Section navigation">
          {visibleItems.map((item) => (
            <TabTrigger
              key={item.key}
              item={item}
              active={item.key === activeKey}
              dense={dense}
              variant={variant}
            />
          ))}
        </RadixTabs.List>
      </div>
    </RadixTabs.Root>
  );
}

function TabTrigger({
  item,
  active,
  dense,
  variant,
}: {
  item: TabsResolvedItem;
  active: boolean;
  dense: boolean;
  variant: TabsVariant;
}) {
  const className = triggerCn({ active, dense, variant, disabled: item.disabled });
  const content = (
    <>
      <span className="truncate">{item.label}</span>
      {typeof item.count === 'number' && (
        <CountBadge count={item.count} active={active} variant={variant} />
      )}
    </>
  );

  if (item.href && !item.disabled) {
    return (
      <RadixTabs.Trigger value={item.key} asChild>
        <Link to={item.href} className={className} aria-current={active ? 'page' : undefined}>
          {content}
        </Link>
      </RadixTabs.Trigger>
    );
  }

  if (item.href && item.disabled) {
    return (
      <RadixTabs.Trigger value={item.key} disabled className={className} asChild>
        <span aria-disabled="true">{content}</span>
      </RadixTabs.Trigger>
    );
  }

  return (
    <RadixTabs.Trigger
      value={item.key}
      disabled={item.disabled}
      onClick={item.onClick}
      className={className}
      aria-current={active ? 'page' : undefined}
    >
      {content}
    </RadixTabs.Trigger>
  );
}

function CountBadge({
  count,
  active,
  variant,
}: {
  count: number;
  active: boolean;
  variant: TabsVariant;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
        variant === 'line' && [
          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
          active && 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
        ],
        variant === 'pill' && [
          'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
          active && 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        ],
      )}
    >
      {count}
    </span>
  );
}

function listCn(variant: TabsVariant, dense: boolean): string {
  return cn(
    'flex min-w-max items-center',
    dense ? 'gap-0.5' : 'gap-1',
    variant === 'line' && 'border-b border-gray-200 pb-1 dark:border-gray-800',
    variant === 'pill' && 'rounded-lg bg-gray-100 p-1 dark:bg-gray-800/50',
  );
}

function triggerCn({
  active,
  dense,
  variant,
  disabled,
}: {
  active: boolean;
  dense: boolean;
  variant: TabsVariant;
  disabled?: boolean;
}): string {
  const base = cn(
    'inline-flex max-w-full items-center gap-2 font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
    dense ? 'h-8 px-2.5 text-xs' : 'h-9 px-3 text-sm',
    disabled && 'cursor-not-allowed opacity-50',
  );

  if (variant === 'line') {
    return cn(
      base,
      'rounded-t-md border-b-2',
      active
        ? 'border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-300'
        : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
    );
  }

  // pill
  return cn(
    base,
    'rounded-md',
    active
      ? 'bg-white shadow-sm text-gray-900 dark:bg-gray-900 dark:text-gray-100'
      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
  );
}
