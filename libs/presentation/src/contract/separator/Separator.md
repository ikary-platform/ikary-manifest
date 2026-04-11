# Separator Contract

**Version:** 1.0 | **Scope:** micro-app-ui | **Status:** Mandatory

`Separator` renders a visual dividing line between content sections, either horizontally or vertically.

## Schema

```ts
type SeparatorPresentation = {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
};
```

When `decorative` is true, `aria-hidden="true"` is set and `role="none"` is used.
When `decorative` is false or omitted, `role="separator"` is set for accessibility.
