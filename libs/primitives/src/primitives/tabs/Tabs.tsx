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
  const className = triggerCn({ dense, variant, disabled: item.disabled });
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
          'bg-muted text-muted-foreground',
          active && 'bg-primary/10 text-primary',
        ],
        variant === 'pill' && [
          'bg-muted text-muted-foreground',
          active && 'bg-background text-foreground',
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
    variant === 'line' && 'h-auto rounded-none border-b bg-transparent p-0',
    variant === 'pill' && [
      'rounded-md bg-muted p-1 text-muted-foreground',
      'gap-1',
      dense ? 'h-8' : 'h-10',
    ],
  );
}

function triggerCn({
  dense,
  variant,
  disabled,
}: {
  dense: boolean;
  variant: TabsVariant;
  disabled?: boolean;
}): string {
  const base = cn(
    'inline-flex items-center justify-center whitespace-nowrap gap-2 font-semibold transition-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0',
    disabled && 'pointer-events-none opacity-50',
  );

  if (variant === 'line') {
    return cn(
      base,
      'relative rounded-none border-b-2 border-b-transparent bg-transparent text-muted-foreground shadow-none',
      dense ? 'h-8 px-3 pb-2 pt-1.5 text-xs' : 'h-9 px-4 pb-3 pt-2 text-sm',
      'data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none',
    );
  }

  // pill
  return cn(
    base,
    'rounded-sm text-muted-foreground ring-offset-background',
    dense ? 'h-7 px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
    'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
  );
}
