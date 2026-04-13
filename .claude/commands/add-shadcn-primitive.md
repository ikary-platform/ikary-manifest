You are porting the shadcn component **$ARGUMENTS** into the ikary primitive system. Follow every step exactly — do not skip any file.

---

## Step 0 — Parse names

Derive three forms from "$ARGUMENTS":
- `PrimitiveName` — PascalCase (e.g. Alert, Badge, Avatar)
- `primitive-name` — kebab-case (e.g. alert, badge, avatar)
- `primitiveName` — camelCase (e.g. alert, badge, avatar) — used only in resolver/register variable names

If $ARGUMENTS contains spaces or mixed case, normalise before continuing.

---

## Step 1 — Read the shadcn source

Use WebFetch to load the shadcn component source page:
`https://ui.shadcn.com/docs/components/<primitive-name>`

From that page extract:
- The component's visual purpose and all user-visible states
- Every prop the component accepts (name, type, default, description)
- Any sub-components that are part of the public API (e.g. AlertTitle, AlertDescription)
- Whether the component is controlled vs uncontrolled
- Which Radix UI primitive (if any) it wraps

Also fetch the raw TypeScript source if a GitHub link is available, or use WebSearch to find the shadcn component source code on GitHub.

---

## Step 2 — Design the contract

Based on the props analysis, design a Zod presentation schema. Rules from CLAUDE.md:

- Every field that crosses a system boundary MUST be a `z.ZodSchema` first
- Use `.strict()` on every object schema
- String fields: `z.string().min(1).optional()` — never `z.string().optional()` (empty string is not valid)
- Boolean fields: `z.boolean().optional()` — never default inside the schema; adapters apply defaults
- Enum fields: `z.enum(['value1', 'value2'])` with a parallel exported `z.infer<>` type
- Arrays of objects: define a sub-schema (e.g. `<Primitive>ItemSchema`) then use `z.array(ItemSchema)`
- Add `.describe('...')` to every non-obvious field — this populates the CONTRACT SCHEMA panel
- Add `.superRefine()` for cross-field validations (mutually exclusive fields, uniqueness checks)
- Do NOT include event handler props in the presentation schema (those go in `ResolverRuntime`)
- Do NOT include React-specific props (className, style, ref, children)

The schema must have a `type: z.literal('<primitive-name>')` discriminator field.

---

## Step 3 — Create ALL files (in order)

### 3a. Presentation contract — schema file
**Path:** `libs/cell-presentation/src/contract/<primitive-name>/<PrimitiveName>PresentationSchema.ts`

```typescript
import { z } from 'zod';

// Sub-schemas first (if needed)

export const <PrimitiveName>PresentationSchema = z
  .object({
    type: z.literal('<primitive-name>'),
    // ... fields from Step 2
  })
  .strict()
  .superRefine((value, ctx) => {
    // cross-field validations (if needed)
  });

export type <PrimitiveName>Presentation = z.infer<typeof <PrimitiveName>PresentationSchema>;
```

### 3b. Presentation contract — validation file
**Path:** `libs/cell-presentation/src/contract/<primitive-name>/validate-runtime-<primitive-name>-presentation.ts`

```typescript
import type { ZodIssue } from 'zod';
import { <PrimitiveName>PresentationSchema, type <PrimitiveName>Presentation } from './<PrimitiveName>PresentationSchema';

export type <PrimitiveName>RuntimeValidationError = {
  path: string;
  message: string;
  code: 'STRUCTURAL_VALIDATION_ERROR';
};

export type ValidateRuntime<PrimitiveName>PresentationResult =
  | { ok: true; value: <PrimitiveName>Presentation; errors: [] }
  | { ok: false; errors: <PrimitiveName>RuntimeValidationError[] };

export function validateRuntime<PrimitiveName>Presentation(input: unknown): ValidateRuntime<PrimitiveName>PresentationResult {
  const parsed = <PrimitiveName>PresentationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: toRuntimeErrors(parsed.error.issues) };
  }
  return { ok: true, value: parsed.data, errors: [] };
}

export function parseRuntime<PrimitiveName>Presentation(input: unknown): <PrimitiveName>Presentation {
  return <PrimitiveName>PresentationSchema.parse(input);
}

function toRuntimeErrors(issues: ZodIssue[]): <PrimitiveName>RuntimeValidationError[] {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: 'STRUCTURAL_VALIDATION_ERROR',
  }));
}
```

### 3c. Presentation contract — samples file
**Path:** `libs/cell-presentation/src/contract/<primitive-name>/<PrimitiveName>.samples.json`

Write 4–6 JSON objects, each a valid `<PrimitiveName>Presentation` (with `"type": "<primitive-name>"`). Cover:
- Default/minimal usage
- All main visual variants
- Disabled state (if applicable)
- Complex content (if applicable)

### 3d. Presentation contract — index
**Path:** `libs/cell-presentation/src/contract/<primitive-name>/index.ts`

```typescript
export * from './<PrimitiveName>PresentationSchema';
export * from './validate-runtime-<primitive-name>-presentation';
```

### 3e. View types
**Path:** `libs/cell-primitives/src/primitives/<primitive-name>/<PrimitiveName>.types.ts`

Define `<PrimitiveName>ViewProps`. Rules:
- Mirrors presentation fields (optional fields stay optional)
- Adds runtime-only props: `on*` callbacks (e.g. `onValueChange?: (v: string) => void`), `describedBy?: string`
- No Zod, no presentation imports — pure TypeScript types
- If there are sub-components, export their view types too (e.g. `<PrimitiveName>ItemView`)

### 3f. Adapter
**Path:** `libs/cell-primitives/src/primitives/<primitive-name>/<PrimitiveName>.adapter.ts`

```typescript
import type { <PrimitiveName>Presentation } from '@ikary/cell-presentation';
import type { <PrimitiveName>ViewProps } from './<PrimitiveName>.types';

export type Build<PrimitiveName>ViewModelInput = {
  presentation: <PrimitiveName>Presentation;
  // runtime-only inputs (callbacks, controlled values, describedBy)
};

export function build<PrimitiveName>ViewModel(input: Build<PrimitiveName>ViewModelInput): <PrimitiveName>ViewProps {
  return {
    // map presentation fields → view props
    // apply defaults here (e.g. disabled: input.presentation.disabled ?? false)
    // normalise text: normalizeOptionalText(input.presentation.label)
  };
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
```

### 3g. View component
**Path:** `libs/cell-primitives/src/primitives/<primitive-name>/<PrimitiveName>.tsx`

- Import `@radix-ui/*` if the shadcn component wraps Radix (check Step 1 analysis)
- Use `cn()` from `'../../lib/utils'` for className composition
- Use shadcn semantic Tailwind tokens (`text-foreground`, `text-muted-foreground`, `bg-muted`, `bg-background`, `border`, `ring`, `primary`, etc.) — NOT hardcoded colors like `text-gray-700` or `bg-blue-600`
- Use `data-[state=*]:` attribute selectors for Radix-driven state (active, open, checked, etc.) instead of conditional className logic
- Pure render: receives `<PrimitiveName>ViewProps`, no business logic, no direct Zod imports
- If the Radix component needs `asChild` for navigation (like Tabs → Link), implement that pattern

### 3h. Resolver
**Path:** `libs/cell-primitives/src/primitives/<primitive-name>/<PrimitiveName>.resolver.ts`

```typescript
import { validateRuntime<PrimitiveName>Presentation } from '@ikary/cell-presentation';
import { build<PrimitiveName>ViewModel, type Build<PrimitiveName>ViewModelInput } from './<PrimitiveName>.adapter';
import type { <PrimitiveName>ViewProps } from './<PrimitiveName>.types';

export type <PrimitiveName>ResolverRuntime = Omit<Build<PrimitiveName>ViewModelInput, 'presentation'>;

export function resolve<PrimitiveName>(
  presentation: unknown,
  runtime: <PrimitiveName>ResolverRuntime = {},
): <PrimitiveName>ViewProps {
  const parsed = validateRuntime<PrimitiveName>Presentation(presentation);

  if (!parsed.ok) {
    // Return a safe fallback that renders visibly but signals invalid state
    return { /* minimal valid props */ };
  }

  return build<PrimitiveName>ViewModel({ presentation: parsed.value, ...runtime });
}
```

### 3i. Registration
**Path:** `libs/cell-primitives/src/primitives/<primitive-name>/register<PrimitiveName>.ts`

```typescript
import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { <PrimitiveName> } from './<PrimitiveName>';
import { resolve<PrimitiveName>, type <PrimitiveName>ResolverRuntime } from './<PrimitiveName>.resolver';
import type { <PrimitiveName>ViewProps } from './<PrimitiveName>.types';

const <primitiveName>Resolver: PrimitiveResolver<unknown, <PrimitiveName>ViewProps, <PrimitiveName>ResolverRuntime> = (
  presentation,
  runtime,
) => resolve<PrimitiveName>(presentation, runtime);

export function register<PrimitiveName>(): void {
  registerPrimitive('<primitive-name>', {
    component: <PrimitiveName>,
    resolver: <primitiveName>Resolver,
  });
}

register<PrimitiveName>();
```

### 3j. Primitive index
**Path:** `libs/cell-primitives/src/primitives/<primitive-name>/index.ts`

```typescript
export { <PrimitiveName> } from './<PrimitiveName>';
export { build<PrimitiveName>ViewModel, type Build<PrimitiveName>ViewModelInput } from './<PrimitiveName>.adapter';
export { resolve<PrimitiveName>, type <PrimitiveName>ResolverRuntime } from './<PrimitiveName>.resolver';
export { register<PrimitiveName> } from './register<PrimitiveName>';
export type { <PrimitiveName>ViewProps } from './<PrimitiveName>.types';
```

---

## Step 4 — Wire up exports in 5 existing files

### 4a. Presentation contract index
**File:** `libs/cell-presentation/src/contract/index.ts`
Add at the end: `export * from './<primitive-name>';`

### 4b. Primitives public index
**File:** `libs/cell-primitives/src/index.ts`
Add a block matching the existing style:
```typescript
export { <PrimitiveName> } from './primitives/<primitive-name>/<PrimitiveName>';
export { build<PrimitiveName>ViewModel, type Build<PrimitiveName>ViewModelInput } from './primitives/<primitive-name>/<PrimitiveName>.adapter';
export { resolve<PrimitiveName>, type <PrimitiveName>ResolverRuntime } from './primitives/<primitive-name>/<PrimitiveName>.resolver';
export type { <PrimitiveName>ViewProps } from './primitives/<primitive-name>/<PrimitiveName>.types';
// Export any sub-types too (e.g. ItemView types)
```

### 4c. Registry
**File:** `libs/cell-primitives/src/registry.ts`
Add at the end: `import './primitives/<primitive-name>/register<PrimitiveName>';`

### 4d. Playground demos
**File:** `apps/cell-playground-legacy/src/pages/primitive-demos.ts`

1. Add to the import block at the top:
   ```typescript
   import type { <PrimitiveName>Presentation } from '@ikary/cell-contract-presentation';
   ```

2. Add a contract type constant:
   ```typescript
   const <PRIMITIVE_NAME>_CONTRACT_TYPE = '<primitive-name>' as const;
   ```

3. Add 3–5 scenario constants (covering default + main variants), each typed as `<PrimitiveName>Presentation`.

4. Add the entry to `PRIMITIVE_DEMOS`:
   ```typescript
   '<primitive-name>': {
     primitive: '<primitive-name>',
     contractType: <PRIMITIVE_NAME>_CONTRACT_TYPE,
     scenarios: [
       { label: 'Default', description: '...', props: PROPS_DEFAULT as unknown as Record<string, unknown>, runtime: {} },
       // ...
     ],
   },
   ```

### 4e. Playground studio categories
**File:** `apps/cell-playground-legacy/src/pages/primitive-studio-page.tsx`
Add to `PRIMITIVE_CATEGORIES`:
```typescript
'<primitive-name>': 'feedback',  // use: data | form | layout | feedback | navigation
```

### 4f. Playground schema registry
**File:** `apps/cell-playground-legacy/src/pages/primitive-studio-page.tsx`
Add to `SCHEMA_BY_CONTRACT_TYPE`:
```typescript
'<primitive-name>': <PrimitiveName>PresentationSchema,
```
Also add the import at the top from `@ikary/cell-contract-presentation`.

---

## Step 5 — Verify

Run:
```
pnpm --filter @ikary/cell-presentation typecheck
pnpm --filter @ikary/cell-primitives typecheck
pnpm --filter @ikary/cell-playground-legacy typecheck
```

Fix any errors before finishing. Common issues:
- Missing `type` import keyword on type-only imports
- Fallback object in resolver missing required fields from `<PrimitiveName>ViewProps`
- Forgot to add `type: z.literal('<primitive-name>')` in the schema

---

## Step 6 — Report back

Summarise what was created:
- List all 10 new files
- List the 6 modified files
- State which Radix primitive (if any) was used
- Note any design decisions made (e.g. which props were omitted because they're styling-only)
- State the playground URL to preview: `http://localhost:4504/primitives/<primitive-name>`
