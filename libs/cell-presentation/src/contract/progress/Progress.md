# Progress Contract

**Version:** 1.0 | **Scope:** micro-app-ui | **Status:** Mandatory

`Progress` displays a linear progress bar indicating task completion.

## Schema

```ts
type ProgressPresentation = {
  value?: number;   // 0–100; omit for indeterminate
  label?: string;
  showValue?: boolean;
};
```

When `value` is omitted, the bar animates as indeterminate.
`showValue` renders the numeric percentage beside the bar.
