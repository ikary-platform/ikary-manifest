# Button Contract

**Version:** 1.0 | **Scope:** micro-app-ui | **Status:** Mandatory

`Button` is the canonical action trigger primitive.

## Schema

```ts
type ButtonPresentation = {
  label: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  buttonType?: 'button' | 'submit' | 'reset';
};
```

## Variants

| Variant | Use when |
|---------|----------|
| `default` | Primary action |
| `destructive` | Dangerous or irreversible action |
| `outline` | Secondary action with visible border |
| `secondary` | Lower-priority action |
| `ghost` | Minimal visual weight |
| `link` | Inline text-style action |
