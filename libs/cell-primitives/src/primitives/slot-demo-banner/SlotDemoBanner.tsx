import type { SlotContext } from '../../shared/slot-context';

interface SlotDemoBannerProps {
  message?: string;
  variant?: 'info' | 'warning' | 'success';
  __slotContext?: SlotContext;
}

const COLORS = {
  info: {
    wrap: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-300',
    badge: 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300',
  },
  warning: {
    wrap: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
    text: 'text-amber-800 dark:text-amber-300',
    badge: 'bg-amber-100 dark:bg-amber-900 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300',
  },
  success: {
    wrap: 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800',
    text: 'text-green-800 dark:text-green-300',
    badge: 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300',
  },
};

/**
 * Development primitive for demonstrating slot injection in the playground.
 * Shows the active slot zone, mode, and an optional message.
 */
export function SlotDemoBanner({
  message = 'Slot binding active',
  variant = 'info',
  __slotContext,
}: SlotDemoBannerProps) {
  const zone = __slotContext?.slotZone ?? 'unknown';
  const mode = __slotContext?.slotMode ?? 'replace';
  const entityName = __slotContext?.entityName;

  const c = COLORS[variant];
  const borderDir =
    mode === 'prepend' ? 'border-b' : mode === 'append' ? 'border-t' : 'border-y';

  const bindingLabel =
    mode === 'prepend' ? `${zone}.before` :
    mode === 'append'  ? `${zone}.after`  :
                         zone;

  return (
    <div className={`flex items-center gap-3 px-4 py-1.5 ${borderDir} ${c.wrap} ${c.text}`}>
      <code className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded border font-mono ${c.badge}`}>
        slot: {bindingLabel}
      </code>
      <span className="text-xs">{message}</span>
      {entityName && (
        <span className="text-xs opacity-50 ml-auto">{entityName}</span>
      )}
    </div>
  );
}
