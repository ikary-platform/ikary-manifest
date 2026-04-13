# Card Contract

**Version:** 1.0 | **Scope:** micro-app-ui | **Status:** Mandatory

`Card` is a content container with optional header, body, and footer sections.

## Schema

```ts
type CardPresentation = {
  title?: string;
  description?: string;
  content?: string;
  footer?: string;
};
```

All fields are optional — at minimum one should be provided. Sections that are absent are not rendered.
