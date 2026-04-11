import * as React from 'react';
import { DayPicker, getDefaultClassNames } from 'react-day-picker';
import type { DayButton } from 'react-day-picker';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

// Ghost nav-button — matches shadcn ghost variant (Tailwind v3)
const navBtn =
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ' +
  'disabled:pointer-events-none disabled:opacity-50 ' +
  'hover:bg-accent hover:text-accent-foreground ' +
  'h-9 w-9 p-0 select-none aria-disabled:opacity-50';

type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3 bg-popover', className)}
      classNames={{
        root: cn('w-fit', defaultClassNames.root),
        months: cn('relative flex flex-col gap-4 md:flex-row', defaultClassNames.months),
        month: cn('flex w-full flex-col gap-4', defaultClassNames.month),
        nav: cn(
          'absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1',
          defaultClassNames.nav,
        ),
        button_previous: cn(navBtn, defaultClassNames.button_previous),
        button_next: cn(navBtn, defaultClassNames.button_next),
        month_caption: cn(
          'flex h-9 w-full items-center justify-center px-9',
          defaultClassNames.month_caption,
        ),
        caption_label: cn('text-sm font-medium select-none', defaultClassNames.caption_label),
        table: 'w-full border-collapse',
        weekdays: cn('flex', defaultClassNames.weekdays),
        weekday: cn(
          'flex-1 rounded-md text-[0.8rem] font-normal text-muted-foreground select-none',
          defaultClassNames.weekday,
        ),
        week: cn('mt-2 flex w-full', defaultClassNames.week),
        day: cn(
          'group/day relative aspect-square h-full w-full rounded-md p-0 text-center select-none',
          defaultClassNames.day,
        ),
        range_start: cn(
          'relative isolate z-0 rounded-l-md bg-muted',
          defaultClassNames.range_start,
        ),
        range_middle: cn('rounded-none', defaultClassNames.range_middle),
        range_end: cn(
          'relative isolate z-0 rounded-r-md bg-muted',
          defaultClassNames.range_end,
        ),
        today: cn(
          'rounded-md bg-muted text-foreground data-[selected=true]:rounded-none',
          defaultClassNames.today,
        ),
        outside: cn(
          'text-muted-foreground aria-selected:text-muted-foreground',
          defaultClassNames.outside,
        ),
        disabled: cn('text-muted-foreground opacity-50', defaultClassNames.disabled),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className: rootCn, rootRef, ...p }) => (
          <div data-slot="calendar" ref={rootRef} className={cn(rootCn)} {...p} />
        ),
        Chevron: ({ orientation, className: chevCn, ...p }) => {
          if (orientation === 'left')
            return <ChevronLeft className={cn('h-4 w-4', chevCn)} {...(p as object)} />;
          if (orientation === 'right')
            return <ChevronRight className={cn('h-4 w-4', chevCn)} {...(p as object)} />;
          return <ChevronRight className={cn('h-4 w-4 rotate-90', chevCn)} {...(p as object)} />;
        },
        DayButton: (p) => <CalendarDayButton {...p} />,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();
  const ref = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const isSelectedSingle =
    modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle;

  return (
    <button
      ref={ref}
      type="button"
      data-selected-single={isSelectedSingle || undefined}
      data-range-start={modifiers.range_start || undefined}
      data-range-end={modifiers.range_end || undefined}
      data-range-middle={modifiers.range_middle || undefined}
      className={cn(
        // Layout
        'relative isolate z-10 flex aspect-square w-full min-w-[2.25rem] items-center justify-center rounded-md text-sm leading-none font-normal',
        // Hover / focus
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        // Disabled
        'disabled:pointer-events-none disabled:opacity-50',
        // Selected single
        'data-[selected-single]:bg-primary data-[selected-single]:text-primary-foreground data-[selected-single]:hover:bg-primary/90',
        // Range
        'data-[range-start]:bg-primary data-[range-start]:text-primary-foreground data-[range-start]:rounded-r-none',
        'data-[range-end]:bg-primary data-[range-end]:text-primary-foreground data-[range-end]:rounded-l-none',
        'data-[range-middle]:bg-muted data-[range-middle]:text-foreground data-[range-middle]:rounded-none',
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}
