# Avatar Contract

**Version:** 1.0 | **Scope:** micro-app-ui | **Status:** Mandatory

`Avatar` displays a user's profile image with an automatic text fallback.

## Schema

```ts
type AvatarPresentation = {
  src?: string;      // Image URL
  alt?: string;
  fallback?: string; // Initials, e.g. "JD"
  size?: 'sm' | 'md' | 'lg';
};
```

When `src` is absent or the image fails to load, `fallback` text is displayed inside the circle.
