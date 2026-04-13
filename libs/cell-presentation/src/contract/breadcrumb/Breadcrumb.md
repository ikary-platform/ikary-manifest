# Breadcrumb Contract

**Version:** 1.0 | **Scope:** micro-app-ui | **Status:** Mandatory

`Breadcrumb` renders a navigational path showing where the user is in the hierarchy.

## Schema

```ts
type BreadcrumbPresentation = {
  items: Array<{ label: string; href?: string }>;
  separator?: 'slash' | 'chevron';
};
```

The last item in `items` is treated as the current page (no link, rendered with foreground color).
All preceding items are rendered as links when `href` is provided.
