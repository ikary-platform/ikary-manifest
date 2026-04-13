# Alert Contract

**Version:** 1.0 | **Scope:** micro-app-ui | **Status:** Mandatory

`Alert` displays a contextual feedback message with an optional title and description.

## Schema

```ts
type AlertPresentation = {
  variant?: 'default' | 'destructive';
  title?: string;
  description?: string;
};
```

## Variants

| Variant | Use when |
|---------|----------|
| `default` | Informational or neutral notice |
| `destructive` | Error, failure, or critical warning |
