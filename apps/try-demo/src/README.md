# try-demo source conventions

These rules apply to every file inside `apps/try-demo/src/`. They exist so
the demo stays easy to read, easy to change, and does not drift back toward
the monolithic patterns the refactor removed.

## 1. One component per file

- A component lives in `ComponentName.tsx`.
- When it grows beyond roughly 80 lines of body or needs internal
  sub-components, promote it to a folder:

  ```
  ComponentName/
    ComponentName.tsx     (composition only)
    ChildA.tsx
    ChildB.tsx
    index.ts              (re-exports the public surface)
  ```

- Callers import from the folder, never from internal files:
  `import { ComponentName } from './chrome/ComponentName';`.

## 2. Components stay dumb

- Take props, render JSX. That is the full job description.
- Data fetching belongs in `hooks/`. Derivation belongs in `utils/`.
- Local UI state (controlled inputs, `open`/`closed` toggles) is fine;
  cross-component state is lifted to the parent or moved into a hook.

## 3. Prefer hooks; avoid `useEffect`

- Every side effect we need is modelled as a custom hook under `hooks/`.
- Data fetches use TanStack Query (`useQuery` / `useMutation`) via the
  `QueryClientProvider` wired in `main.tsx`. Never hand-roll
  `useEffect(() => { fetch... })`.
- Animations that used to be timed with `setTimeout` should be CSS
  animations. For one-shot mount transitions, render the element
  conditionally and key it on the relevant identity (for example
  `manifest.metadata.key`) so a new identity replays the animation.
- If you genuinely need `useEffect`, put it inside a named hook in
  `hooks/` with a docstring explaining why.

## 4. No hardcoded CSS in JSX

- No `style={{ marginTop: 12 }}`, no literal colors, no px-denominated
  magic numbers in TSX.
- Use classes backed by design tokens in `styles.css`
  (`--space-*`, `--radius-*`, `--z-*`, `--ob-*`, and the shadcn HSL set
  used by `cell-renderer`).
- The single tolerated inline style is a CSS-variable reference on an
  SVG element where no class-based path exists (for example,
  `style={{ fill: 'var(--ob-wave-1)' }}` on a `<path>`). It is never a
  literal value.

## 5. Code reuse inside folders

- Small helpers used by more than one sibling live next to them
  (for example `OnboardingBackground/wave-paths.ts`,
  `RunLocallyPanel/infer-slug.ts`).
- Helpers used across folders move up to `utils/` with a named export.

## 6. External URLs

- Every `href` pointing outside the demo resolves through
  `config/links.ts`. Direct `https://...` literals in JSX are not
  accepted.

## Folder map

```
src/
  App.tsx              - shell; wires hook + split children, no logic
  main.tsx             - React + Router + QueryClient bootstrap
  styles.css           - global tokens + layout + component rules
  README.md            - this file

  config/              - compile-time constants (links, etc.)
  hooks/               - every side effect + data-fetching concern
  utils/               - pure functions and shared constants
  stream/              - SSE transport + demo-api fetchers (pure)

  chrome/              - app shell: header, background, panels
  chat/                - chat rail + blueprint fallback
  preview/             - right-hand preview surface
```

## Verification helpers

Before committing, run:

```bash
pnpm --filter @ikary/try-demo typecheck
grep -rn "useEffect" src              # expect 0 hits
grep -rn "style={{" src               # expect <= 2 hits (SVG fill vars only)
grep -rnE "[0-9]+px|#[0-9a-fA-F]{3,6}" src --include="*.tsx"   # expect 0 hits
```
