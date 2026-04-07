# App Shell Definition

Configures the application shell: layout mode, UI regions, branding, navigation slots, capabilities, and responsive breakpoints.

## Responsibility Boundary

**Owns:** Shell-level layout structure, region toggles, branding, navigation slot composition, capability flags, responsive settings, and the page outlet.

**Does not own:** Page content rendered inside the outlet, entity definitions, or cell-level routing.

## Canonical Position

```
Cell Manifest
  └── Spec
       └── App Shell (this)
            ├── Layout
            ├── Branding
            ├── Regions[]
            ├── Navigation (primary / secondary / footer)
            ├── Capabilities
            ├── Responsive
            └── Outlet
```

## Schema Shape

```yaml
type: object
required: [key, name, layout, regions, outlet]
additionalProperties: false
```

## Fields

### `key`

| Key       | Value              |
|-----------|--------------------|
| Type      | `string`           |
| Required  | Yes                |
| Min Length | 1                  |

Unique identifier for the shell within the manifest.

### `name`

| Key       | Value              |
|-----------|--------------------|
| Type      | `string`           |
| Required  | Yes                |
| Min Length | 1                  |

Human-readable display name for the shell.

### `layout`

| Key       | Value              |
|-----------|--------------------|
| Type      | `object`           |
| Required  | Yes                |

Controls the overall page structure.

**Sub-properties:**

| Property          | Type     | Required | Description |
|-------------------|----------|----------|-------------|
| `mode`            | `string` | Yes      | One of `sidebar-content`, `topbar-content`, `sidebar-topbar-content`, `minimal`. |
| `maxContentWidth` | `number` or `"full"` | No | Maximum width of the content area. A positive number sets a pixel cap. `"full"` removes the cap. |
| `contentPadding`  | `string` | No       | One of `none`, `sm`, `md`, `lg`. |

### `branding`

| Key       | Value              |
|-----------|--------------------|
| Type      | `object`           |
| Required  | No                 |

Visual identity shown in the shell header or sidebar.

**Sub-properties:**

| Property          | Type      | Required | Description |
|-------------------|-----------|----------|-------------|
| `logo`            | `string`  | No       | Path or URL to a logo image. |
| `productName`     | `string`  | No       | Product name displayed alongside the logo. |
| `showProductName` | `boolean` | No       | Whether to render the product name. |

### `regions`

| Key       | Value              |
|-----------|--------------------|
| Type      | `array`            |
| Required  | Yes                |
| Min Items | 1                  |

List of region configuration objects. Each region controls a distinct area of the shell.

**Region item properties:**

| Property           | Type      | Required | Description |
|--------------------|-----------|----------|-------------|
| `key`              | `string`  | Yes      | One of `topbar`, `sidebar`, `main`, `aside`, `footer`, `commandBar`, `notifications`. |
| `enabled`          | `boolean` | Yes      | Whether the region renders. |
| `collapsible`      | `boolean` | No       | Whether the user can collapse the region. |
| `defaultCollapsed` | `boolean` | No       | Whether the region starts collapsed. |
| `resizable`        | `boolean` | No       | Whether the user can resize the region. |
| `sticky`           | `boolean` | No       | Whether the region stays fixed during scroll. |
| `width`            | `number`  | No       | Default width in pixels. Must be greater than 0. |
| `minWidth`         | `number`  | No       | Minimum width in pixels. Must be greater than 0. |
| `maxWidth`         | `number`  | No       | Maximum width in pixels. Must be greater than 0. |
| `order`            | `integer` | No       | Render order among sibling regions. |

### `navigation`

| Key       | Value              |
|-----------|--------------------|
| Type      | `object`           |
| Required  | No                 |

Organizes navigation items into three slots: `primary`, `secondary`, and `footer`.
Each slot holds an array of `ShellNavItem` objects.

### `capabilities`

| Key       | Value              |
|-----------|--------------------|
| Type      | `object`           |
| Required  | No                 |

Boolean flags that enable or disable shell-level features.

| Flag                 | Type      | Description |
|----------------------|-----------|-------------|
| `globalSearch`       | `boolean` | Show the global search bar. |
| `workspaceSwitcher`  | `boolean` | Show the workspace picker. |
| `tenantSwitcher`     | `boolean` | Show the tenant picker. |
| `commandPalette`     | `boolean` | Enable the command palette (Cmd+K). |
| `notifications`      | `boolean` | Show the notification center. |
| `breadcrumbs`        | `boolean` | Render breadcrumbs in the topbar. |
| `userMenu`           | `boolean` | Show the user avatar menu. |
| `themeSwitcher`      | `boolean` | Show the light/dark theme toggle. |

### `responsive`

| Key       | Value              |
|-----------|--------------------|
| Type      | `object`           |
| Required  | No                 |

Breakpoint settings that control how the shell adapts to smaller viewports.

| Property                | Type      | Description |
|-------------------------|-----------|-------------|
| `mobileBreakpoint`      | `number`  | Viewport width (px) below which the shell switches to mobile mode. |
| `collapseSidebarBelow`  | `number`  | Viewport width (px) below which the sidebar auto-collapses. |
| `collapseAsideBelow`    | `number`  | Viewport width (px) below which the aside panel auto-collapses. |
| `hideLabelsBelow`       | `number`  | Viewport width (px) below which text labels hide, showing icons only. |
| `overlaySidebarOnMobile` | `boolean` | Whether the sidebar renders as an overlay on mobile instead of pushing content. |

### `outlet`

| Key       | Value              |
|-----------|--------------------|
| Type      | `object`           |
| Required  | Yes                |

Declares where page content renders within the shell.

**Sub-properties:**

| Property | Type     | Required | Const  | Description |
|----------|----------|----------|--------|-------------|
| `type`   | `string` | Yes      | `page` | Content type routed into the outlet. |
| `region` | `string` | Yes      | `main` | Target region for the outlet. |

## ShellNavItem (from `$defs`)

Recursive navigation item used in the `primary`, `secondary`, and `footer` arrays.

| Property        | Type      | Required | Description |
|-----------------|-----------|----------|-------------|
| `key`           | `string`  | Yes      | Unique item identifier. |
| `label`         | `string`  | Yes      | Display text. |
| `icon`          | `string`  | No       | Icon name or path. |
| `href`          | `string`  | No       | Navigation target. |
| `capabilityKey` | `string`  | No       | Capability key that gates visibility. |
| `external`      | `boolean` | No       | Whether the link opens in a new tab. |
| `children`      | `array`   | No       | Nested `ShellNavItem` objects. Supports arbitrary depth. |

## Child Schema References

This schema is self-contained. `ShellNavItem` is defined in `$defs` within the same file.

## Semantic Invariants

- `key`, `name`, `layout`, `regions`, and `outlet` are required.
- `regions` must contain at least one item.
- `outlet.type` is always `page` and `outlet.region` is always `main`. These are constants.
- `layout.mode` must be one of the four allowed enum values.
- Region `key` values must come from the fixed set: `topbar`, `sidebar`, `main`, `aside`, `footer`, `commandBar`, `notifications`.
- `ShellNavItem.children` creates a recursive tree. There is no enforced depth limit in the schema.
- All boolean capabilities default to `false` at the application level when omitted.

## Minimal YAML Example

```yaml
key: my-shell
name: My Shell
layout:
  mode: sidebar-content
regions:
  - key: sidebar
    enabled: true
  - key: main
    enabled: true
outlet:
  type: page
  region: main
```

## Rich YAML Example

```yaml
key: crm-shell
name: CRM Application Shell
layout:
  mode: sidebar-topbar-content
  maxContentWidth: 1440
  contentPadding: md
branding:
  logo: /assets/logo.svg
  productName: Acme CRM
  showProductName: true
regions:
  - key: topbar
    enabled: true
    sticky: true
  - key: sidebar
    enabled: true
    collapsible: true
    defaultCollapsed: false
    resizable: true
    width: 260
    minWidth: 200
    maxWidth: 400
  - key: main
    enabled: true
  - key: aside
    enabled: false
  - key: footer
    enabled: true
navigation:
  primary:
    - key: dashboard
      label: Dashboard
      icon: home
      href: /dashboard
    - key: customers
      label: Customers
      icon: users
      href: /customers
      children:
        - key: customer-list
          label: All Customers
          href: /customers
        - key: customer-segments
          label: Segments
          href: /customers/segments
  secondary:
    - key: settings
      label: Settings
      icon: gear
      href: /settings
  footer:
    - key: docs
      label: Documentation
      icon: book
      href: https://docs.example.com
      external: true
capabilities:
  globalSearch: true
  commandPalette: true
  notifications: true
  breadcrumbs: true
  userMenu: true
  themeSwitcher: true
  workspaceSwitcher: false
  tenantSwitcher: false
responsive:
  mobileBreakpoint: 768
  collapseSidebarBelow: 1024
  collapseAsideBelow: 1280
  hideLabelsBelow: 640
  overlaySidebarOnMobile: true
outlet:
  type: page
  region: main
```

## Forbidden Patterns

| Pattern | Why |
|---------|-----|
| Missing `outlet` | Required. The shell must know where to render page content. |
| `outlet.type` set to anything other than `page` | The field is a `const`. |
| `outlet.region` set to anything other than `main` | The field is a `const`. |
| Region `key` outside the allowed set | Only `topbar`, `sidebar`, `main`, `aside`, `footer`, `commandBar`, and `notifications` are valid. |
| `regions` as an empty array | `minItems: 1` requires at least one region. |
| Extra properties on any object | Every object in this schema sets `additionalProperties: false`. |
| `layout.mode` set to an unlisted value | Must be one of `sidebar-content`, `topbar-content`, `sidebar-topbar-content`, `minimal`. |
