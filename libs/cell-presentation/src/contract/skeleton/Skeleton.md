# Skeleton Contract

**Version:** 1.0 | **Scope:** micro-app-ui | **Status:** Mandatory

`Skeleton` renders one or more animated placeholder shapes to communicate loading state.

## Schema

```ts
type SkeletonPresentation = {
  count?: number;        // defaults to 1
  heightClass?: string;  // Tailwind height utility, e.g. "h-4"
  widthClass?: string;   // Tailwind width utility, e.g. "w-full"
};
```
