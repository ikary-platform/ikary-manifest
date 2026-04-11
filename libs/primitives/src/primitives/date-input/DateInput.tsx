import { useState, useRef } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from './Calendar';
import type { DateInputViewProps } from './DateInput.types';

export function DateInput({
  value,
  defaultValue,
  placeholder = 'Pick a date',
  disabled = false,
  readonly = false,
  required = false,
  invalid = false,
  loading = false,
  id,
  describedBy,
  onValueChange,
  onBlur,
}: DateInputViewProps) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);

  // Controlled: use `value` prop; uncontrolled: fall back to internal state
  const resolvedValue = value !== undefined ? value : internalValue;
  const selectedDate = resolvedValue ? parseISODate(resolvedValue) : undefined;

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    const iso = toISODate(date);
    if (value === undefined) setInternalValue(iso);
    onValueChange?.(iso);
    setOpen(false);
  }

  function handleOpenChange(next: boolean) {
    if (disabled || readonly) return;
    if (!next) onBlur?.();
    setOpen(next);
  }

  const displayText = selectedDate ? formatDisplay(selectedDate) : null;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-invalid={invalid ? 'true' : undefined}
          aria-describedby={describedBy}
          aria-required={required ? 'true' : undefined}
          className={[
            'inline-flex h-9 w-[280px] items-center gap-2 rounded-md border border-input bg-background px-3 text-left text-sm',
            'ring-offset-background transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            displayText ? 'text-foreground' : 'text-muted-foreground font-normal',
            invalid ? 'border-destructive focus-visible:ring-destructive/30' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 opacity-50" />
          <span className="flex-1 truncate">{displayText ?? placeholder}</span>
          {loading && <InlineSpinner />}
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className={[
            'z-50 rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
            'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          ].join(' ')}
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

/** Parse an ISO date string (YYYY-MM-DD) to a local Date with no timezone shift. */
function parseISODate(iso: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return undefined;
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return isNaN(date.getTime()) ? undefined : date;
}

/** Format a local Date back to YYYY-MM-DD. */
function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Human-readable display format — matches shadcn "PPP" (e.g. "April 11, 2026"). */
function formatDisplay(date: Date): string {
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function InlineSpinner() {
  return (
    <span
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-border border-t-foreground/50"
    />
  );
}
