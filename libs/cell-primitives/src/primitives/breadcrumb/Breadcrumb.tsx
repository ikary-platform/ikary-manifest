import type { BreadcrumbViewProps, BreadcrumbItemView, BreadcrumbSeparator } from './Breadcrumb.types';

export function Breadcrumb({ items, separator = 'slash' }: BreadcrumbViewProps) {
  return (
    <nav aria-label="breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="inline-flex items-center gap-1.5 sm:gap-2.5">
              <BreadcrumbSegment item={item} isLast={isLast} />
              {!isLast ? <BreadcrumbSeparatorEl separator={separator} /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function BreadcrumbSegment({ item, isLast }: { item: BreadcrumbItemView; isLast: boolean }) {
  if (isLast) {
    return (
      <span aria-current="page" className="font-normal text-foreground">
        {item.label}
      </span>
    );
  }
  if (item.href) {
    return (
      <a href={item.href} className="transition-colors hover:text-foreground">
        {item.label}
      </a>
    );
  }
  return <span>{item.label}</span>;
}

function BreadcrumbSeparatorEl({ separator }: { separator: BreadcrumbSeparator }) {
  if (separator === 'chevron') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    );
  }
  return <span aria-hidden="true">/</span>;
}
