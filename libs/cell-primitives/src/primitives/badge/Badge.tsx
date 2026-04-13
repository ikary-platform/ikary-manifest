import type { BadgeViewProps, BadgeVariant } from './Badge.types';

export function Badge({ label, variant = 'default' }: BadgeViewProps) {
  return (
    <span className={badgeCn(variant)}>
      {label}
    </span>
  );
}

function badgeCn(variant: BadgeVariant): string {
  const base =
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
  switch (variant) {
    case 'secondary':
      return `${base} border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80`;
    case 'destructive':
      return `${base} border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80`;
    case 'outline':
      return `${base} text-foreground`;
    default:
      return `${base} border-transparent bg-primary text-primary-foreground hover:bg-primary/80`;
  }
}
