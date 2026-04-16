/**
 * Minimal inline implementations of shadcn/ui primitives we need.
 *
 * These mirror https://ui.shadcn.com/ component APIs and class names so the
 * cell's blocks feel identical to the shadcn blocks gallery
 * (https://ui.shadcn.com/blocks). Kept as a tiny helper file instead of
 * pulling shadcn itself into the cell.
 */

import type { HTMLAttributes, ReactNode } from 'react';

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

// ── Card ─────────────────────────────────────────────────────────────────────

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'grid auto-rows-min grid-cols-[1fr_auto] items-start gap-1.5 px-6',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('col-start-1 leading-none font-semibold', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('col-start-1 text-sm text-muted-foreground', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardAction({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center px-6', className)} {...props}>
      {children}
    </div>
  );
}

// ── Badge ────────────────────────────────────────────────────────────────────

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
}

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'border-transparent bg-primary text-primary-foreground',
    secondary: 'border-transparent bg-secondary text-secondary-foreground',
    outline: 'border-border bg-background text-foreground',
    destructive:
      'border-transparent bg-destructive text-destructive-foreground',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium [&>svg]:pointer-events-none [&>svg]:shrink-0',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// ── Separator ────────────────────────────────────────────────────────────────

export function Separator({ className }: { className?: string }) {
  return <div role="separator" className={cn('h-px w-full bg-border', className)} />;
}

// ── Icons (tiny inline set) ──────────────────────────────────────────────────

interface IconProps {
  size?: number;
  className?: string;
}

function svgProps(size: number): HTMLAttributes<SVGElement> {
  return {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    width: size as unknown as number,
    height: size as unknown as number,
    style: { flexShrink: 0, display: 'inline-block' },
  } as unknown as HTMLAttributes<SVGElement>;
}

export function IconTrendingUp({ size = 14, className }: IconProps) {
  return (
    <svg {...(svgProps(size) as Record<string, unknown>)} aria-hidden className={className}>
      <path d="M7 17 L17 7 M17 7 H9 M17 7 V15" />
    </svg>
  );
}

export function IconTrendingDown({ size = 14, className }: IconProps) {
  return (
    <svg {...(svgProps(size) as Record<string, unknown>)} aria-hidden className={className}>
      <path d="M7 7 L17 17 M17 17 H9 M17 17 V9" />
    </svg>
  );
}

export function IconMinus({ size = 14, className }: IconProps) {
  return (
    <svg {...(svgProps(size) as Record<string, unknown>)} aria-hidden className={className}>
      <path d="M5 12 H19" />
    </svg>
  );
}

export function IconMoreHorizontal({ size = 16, className }: IconProps) {
  return (
    <svg {...(svgProps(size) as Record<string, unknown>)} aria-hidden className={className}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}

export function IconChevronRight({ size = 16, className }: IconProps) {
  return (
    <svg {...(svgProps(size) as Record<string, unknown>)} aria-hidden className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
