export type BreadcrumbSeparator = 'slash' | 'chevron';

export type BreadcrumbItemView = {
  label: string;
  href?: string;
};

export type BreadcrumbViewProps = {
  items: BreadcrumbItemView[];
  separator?: BreadcrumbSeparator;
};
