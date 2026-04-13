import type { ButtonViewProps, ButtonVariant, ButtonSize } from './Button.types';

export function Button({
  label,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  buttonType = 'button',
  onClick,
}: ButtonViewProps) {
  return (
    <button
      type={buttonType}
      disabled={disabled || loading}
      onClick={onClick}
      className={buttonCn(variant, size)}
    >
      {loading ? <InlineSpinner /> : null}
      {label}
    </button>
  );
}

function buttonCn(variant: ButtonVariant, size: ButtonSize): string {
  const base = [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium',
    'ring-offset-background transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
  ].join(' ');

  const variantClass = variantCn(variant);
  const sizeClass = sizeCn(size);
  return [base, variantClass, sizeClass].join(' ');
}

function variantCn(variant: ButtonVariant): string {
  switch (variant) {
    case 'destructive':
      return 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
    case 'outline':
      return 'border border-input bg-background hover:bg-muted hover:text-accent-foreground';
    case 'secondary':
      return 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
    case 'ghost':
      return 'hover:bg-muted hover:text-accent-foreground';
    case 'link':
      return 'text-primary underline-offset-4 hover:underline';
    default:
      return 'bg-primary text-primary-foreground hover:bg-primary/90';
  }
}

function sizeCn(size: ButtonSize): string {
  switch (size) {
    case 'sm':
      return 'h-9 rounded-md px-3';
    case 'lg':
      return 'h-11 rounded-md px-8';
    case 'icon':
      return 'h-10 w-10';
    default:
      return 'h-10 px-4 py-2';
  }
}

function InlineSpinner() {
  return (
    <span
      aria-hidden="true"
      className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}
