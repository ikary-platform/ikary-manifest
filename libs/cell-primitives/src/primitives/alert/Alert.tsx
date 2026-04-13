import type { AlertViewProps, AlertVariant } from './Alert.types';

export function Alert({ variant = 'default', title, description }: AlertViewProps) {
  return (
    <div role="alert" className={alertCn(variant)}>
      <AlertIcon variant={variant} />
      {title ? <h5 className="mb-1 font-medium leading-none tracking-tight">{title}</h5> : null}
      {description ? <p className="text-sm [&_p]:leading-relaxed">{description}</p> : null}
    </div>
  );
}

function alertCn(variant: AlertVariant): string {
  const base =
    'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground';
  if (variant === 'destructive') {
    return `${base} border-destructive/50 text-destructive [&>svg]:text-destructive`;
  }
  return `${base} bg-background text-foreground`;
}

function AlertIcon({ variant }: { variant: AlertVariant }) {
  if (variant === 'destructive') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
