# Badge Contract

**Version:** 1.0 | **Scope:** micro-app-ui | **Status:** Mandatory

`Badge` is a small inline label used to surface status, counts, or categorical metadata.

## Schema

```ts
type BadgePresentation = {
  label: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
};
```

## Variants

| Variant | Use when |
|---------|----------|
| `default` | Primary highlight (active, new, featured) |
| `secondary` | Neutral secondary info |
| `destructive` | Error, deleted, blocked |
| `outline` | Subdued, draft |
