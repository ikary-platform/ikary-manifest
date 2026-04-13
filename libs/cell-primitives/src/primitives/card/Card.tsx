import type { CardViewProps } from './Card.types';

export function Card({ title, description, content, footer }: CardViewProps) {
  const hasHeader = Boolean(title || description);

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      {hasHeader ? (
        <div className="flex flex-col space-y-1.5 p-6">
          {title ? (
            <h3 className="text-2xl font-semibold leading-none tracking-tight">{title}</h3>
          ) : null}
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}

      {content ? (
        <div className="p-6 pt-0">
          <p className="text-sm text-foreground">{content}</p>
        </div>
      ) : null}

      {footer ? (
        <div className="flex items-center p-6 pt-0">
          <p className="text-sm text-muted-foreground">{footer}</p>
        </div>
      ) : null}
    </div>
  );
}
