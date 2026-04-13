# Label Contract

**Version:** 1.0 | **Scope:** micro-app-ui | **Status:** Mandatory

`Label` renders a semantic `<label>` element associated with a form control.

## Schema

```ts
type LabelPresentation = {
  text: string;
  htmlFor?: string;
  required?: boolean;
};
```

`Label` is the low-level label primitive. It does not own help text, validation messages,
or field layout — those belong to `FormField`.
