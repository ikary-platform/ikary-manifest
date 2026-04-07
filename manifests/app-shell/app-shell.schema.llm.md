# app-shell.schema.llm.md

## 1. Purpose

This document describes the language-neutral JSON Schema definition for the **AppShellDefinition** schema, located at `manifests/app-shell/app-shell.schema.yaml`. It validates the layout, branding, regions, navigation, capabilities, and responsive behavior of a Cell's application shell. This LLD exists for code generation tasks.

## 2. Owned Responsibilities

- Validates `key` and `name` as non-empty strings.
- Validates `layout` with a required `mode` enum (`sidebar-content`, `topbar-content`, `sidebar-topbar-content`, `minimal`), optional `maxContentWidth`, and optional `contentPadding`.
- Validates `branding` with optional `logo`, `productName`, and `showProductName`.
- Validates `regions` as a non-empty array of region objects, each with a required `key` enum and `enabled` flag.
- Validates `navigation` with optional `primary`, `secondary`, and `footer` arrays of `ShellNavItem`.
- Validates `capabilities` with boolean toggles for shell-level features (globalSearch, commandPalette, notifications, breadcrumbs, and others).
- Validates `responsive` with optional breakpoint thresholds and mobile overlay settings.
- Validates `outlet` with required `type` (constant `page`) and `region` (constant `main`).
- Requires `key`, `name`, `layout`, `regions`, and `outlet`.
- Rejects unknown properties via `additionalProperties: false` at all levels.

## 3. Out of Scope

- UI rendering of shell regions or navigation items.
- Runtime layout engine behavior.
- Transport layer concerns.
- Business logic beyond structural schema validation.

## 4. Runtime Inputs

- `key` -- string, required, minLength 1
- `name` -- string, required, minLength 1
- `layout` -- object, required (`mode`, `maxContentWidth`, `contentPadding`)
- `branding` -- object, optional (`logo`, `productName`, `showProductName`)
- `regions` -- array of objects, required, minItems 1 (each: `key`, `enabled`, `collapsible`, `defaultCollapsed`, `resizable`, `sticky`, `width`, `minWidth`, `maxWidth`, `order`)
- `navigation` -- object, optional (`primary`, `secondary`, `footer` arrays of ShellNavItem)
- `capabilities` -- object, optional (`globalSearch`, `workspaceSwitcher`, `tenantSwitcher`, `commandPalette`, `notifications`, `breadcrumbs`, `userMenu`, `themeSwitcher`)
- `responsive` -- object, optional (`mobileBreakpoint`, `collapseSidebarBelow`, `collapseAsideBelow`, `hideLabelsBelow`, `overlaySidebarOnMobile`)
- `outlet` -- object, required (`type: page`, `region: main`)

## 5. Primitive Composition

- `$defs/ShellNavItem` -- recursive local definition used by `navigation.primary[]`, `navigation.secondary[]`, and `navigation.footer[]`. Each ShellNavItem has `key`, `label`, `icon`, `href`, `capabilityKey`, `external`, and a recursive `children` array.

No external `$ref` schemas are referenced.

## 6. Render-State Mapping

This is a schema-layer unit and does not own UI render-state.

## 7. Interaction Model

Interaction is declarative. Data fields and keys are emitted, not executed.

## 8. Routing Model

No routing side effects are owned. The `href` values in ShellNavItem and region keys are validated as data only.

## 9. Files to Generate or Update

- `manifests/app-shell/app-shell.schema.yaml` -- YAML schema source
- `manifests/app-shell/app-shell.schema.md` -- human-readable documentation
- `manifests/app-shell/app-shell.schema.llm.md` -- this LLM implementation guide
- `contracts/node/contract/src/contract/manifest/shell/AppShellDefinitionSchema.ts` -- TypeScript mirror

## 10. Repo Constraints

- Kebab-case file naming with `.schema` suffix.
- JSON Schema Draft 2020-12 format.
- Use `$ref` for composition; apply `additionalProperties: false` where applicable.
- Keep extensions additive and backward compatible.
