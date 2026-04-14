# Slot Examples

This page shows concrete examples for every slot zone across all supported page types. Each example includes the manifest YAML and the matching primitive component.

The examples use a "products" entity throughout so you can see how `__slotContext` carries entity information from page to primitive.

## Entity-list page

Available zones: `header`, `toolbar`, `table`, `footer`.

### Prepend before the header

Add a dismissible banner above the page title.

```yaml
pages:
  - key: products-list
    type: entity-list
    title: Products
    path: /products
    entity: product
    slotBindings:
      - slot: header.before
        primitive: beta-banner
        props:
          message: "Product management is in preview."
```

```typescript
// primitives/beta-banner/BetaBanner.tsx
import type { SlotContext } from '@ikary/cell-primitives';

interface BetaBannerProps {
  message: string;
  __slotContext?: SlotContext;
}

export function BetaBanner({ message }: BetaBannerProps) {
  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2 text-sm text-yellow-800">
      {message}
    </div>
  );
}
```

The banner renders above the page title row. The rest of the page is unchanged.

---

### Append after the toolbar

Add an export button next to the search bar.

```yaml
slotBindings:
  - slot: toolbar.after
    primitive: export-button
    props:
      format: csv
```

```typescript
// primitives/export-button/ExportButton.tsx
import type { SlotContext } from '@ikary/cell-primitives';

interface ExportButtonProps {
  format: 'csv' | 'json';
  __slotContext?: SlotContext;
}

export function ExportButton({ format, __slotContext }: ExportButtonProps) {
  const label = `Export ${__slotContext?.entityPluralName ?? 'records'} as ${format.toUpperCase()}`;

  return (
    <button
      type="button"
      className="h-8 px-3 rounded-md border text-sm"
      onClick={() => console.log(`export ${format}`)}
    >
      {label}
    </button>
  );
}
```

`__slotContext.entityPluralName` resolves to `"Products"` at runtime, producing "Export Products as CSV".

---

### Replace the toolbar

Swap out the default search input entirely with a custom filter panel.

```yaml
slotBindings:
  - slot: toolbar
    primitive: advanced-filter-panel
```

```typescript
// primitives/advanced-filter-panel/AdvancedFilterPanel.tsx
import { useState } from 'react';
import type { SlotContext } from '@ikary/cell-primitives';

interface AdvancedFilterPanelProps {
  __slotContext?: SlotContext;
}

export function AdvancedFilterPanel({ __slotContext }: AdvancedFilterPanelProps) {
  const [status, setStatus] = useState('');

  return (
    <div className="flex gap-2">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="h-8 rounded-md border px-3 text-sm"
      >
        <option value="">All statuses</option>
        <option value="active">Active</option>
        <option value="archived">Archived</option>
      </select>
      <span className="text-xs text-muted-foreground self-center">
        Filtering {__slotContext?.entityPluralName}
      </span>
    </div>
  );
}
```

The default search input no longer renders. Only `advanced-filter-panel` appears in the toolbar zone.

---

### Append a summary card after the table

Show totals below the data grid.

```yaml
slotBindings:
  - slot: table.after
    primitive: record-count-summary
```

```typescript
// primitives/record-count-summary/RecordCountSummary.tsx
import type { SlotContext } from '@ikary/cell-primitives';

interface RecordCountSummaryProps {
  __slotContext?: SlotContext;
}

export function RecordCountSummary({ __slotContext }: RecordCountSummaryProps) {
  return (
    <div className="px-4 py-2 text-xs text-muted-foreground border-t">
      Showing {__slotContext?.entityPluralName ?? 'records'} from live data source.
    </div>
  );
}
```

---

### Replace the footer

Override the default pagination controls.

```yaml
slotBindings:
  - slot: footer
    primitive: compact-pagination
```

```typescript
// primitives/compact-pagination/CompactPagination.tsx
import type { SlotContext } from '@ikary/cell-primitives';

interface CompactPaginationProps {
  __slotContext?: SlotContext;
}

export function CompactPagination({ __slotContext }: CompactPaginationProps) {
  return (
    <div className="flex justify-end px-6 py-3 border-t text-sm">
      <span>{__slotContext?.pageTitle} — page controls</span>
    </div>
  );
}
```

---

### Multiple bindings on one page

Bindings stack in declaration order. Prepend and append bindings accumulate; replace bindings follow last-wins.

```yaml
slotBindings:
  - slot: header.before
    primitive: beta-banner
    props:
      message: "Preview mode."
  - slot: toolbar.after
    primitive: export-button
    props:
      format: csv
  - slot: toolbar.after
    primitive: bulk-actions
  - slot: table.after
    primitive: record-count-summary
```

The two `toolbar.after` bindings both render, in order: `export-button` appears first, then `bulk-actions`.

---

## Entity-detail page

Available zones: `header`, `navigation`, `content`, `footer`.

### Prepend a warning above the header

```yaml
pages:
  - key: product-detail
    type: entity-detail
    title: Product
    path: /products/:id
    entity: product
    slotBindings:
      - slot: header.before
        primitive: archive-warning
```

```typescript
// primitives/archive-warning/ArchiveWarning.tsx
import type { SlotContext } from '@ikary/cell-primitives';

interface ArchiveWarningProps {
  __slotContext?: SlotContext;
}

export function ArchiveWarning({ __slotContext }: ArchiveWarningProps) {
  return (
    <div className="bg-red-50 border-b border-red-200 px-6 py-2 text-sm text-red-800">
      This {__slotContext?.entityName ?? 'record'} is archived and read-only.
    </div>
  );
}
```

The warning appears above the entity name and action buttons in the header.

---

### Replace the navigation tabs

Swap the standard Overview / History / Audit tabs with a custom set.

```yaml
slotBindings:
  - slot: navigation
    primitive: product-tabs
```

```typescript
// primitives/product-tabs/ProductTabs.tsx
import { NavLink } from 'react-router-dom';
import type { SlotContext } from '@ikary/cell-primitives';

interface ProductTabsProps {
  __slotContext?: SlotContext;
}

export function ProductTabs({ __slotContext }: ProductTabsProps) {
  const base = `/products/${window.location.pathname.split('/').at(-1)}`;

  return (
    <nav className="flex gap-4 px-6 border-b">
      <NavLink to={base} end className="py-2 text-sm border-b-2 border-transparent [&.active]:border-primary">
        Details
      </NavLink>
      <NavLink to={`${base}/inventory`} className="py-2 text-sm border-b-2 border-transparent [&.active]:border-primary">
        Inventory
      </NavLink>
      <NavLink to={`${base}/pricing`} className="py-2 text-sm border-b-2 border-transparent [&.active]:border-primary">
        Pricing
      </NavLink>
    </nav>
  );
}
```

---

### Append a related records panel after the content

```yaml
slotBindings:
  - slot: content.after
    primitive: related-orders
    props:
      maxItems: 5
```

```typescript
// primitives/related-orders/RelatedOrders.tsx
import type { SlotContext } from '@ikary/cell-primitives';

interface RelatedOrdersProps {
  maxItems?: number;
  __slotContext?: SlotContext;
}

export function RelatedOrders({ maxItems = 5, __slotContext }: RelatedOrdersProps) {
  return (
    <div className="border-t px-6 py-4">
      <h3 className="text-sm font-medium mb-3">
        Recent orders for this {__slotContext?.entityName ?? 'record'}
      </h3>
      <p className="text-xs text-muted-foreground">
        Showing up to {maxItems} orders.
      </p>
    </div>
  );
}
```

---

### Add a save reminder to the footer

```yaml
slotBindings:
  - slot: footer.before
    primitive: unsaved-changes-reminder
```

```typescript
// primitives/unsaved-changes-reminder/UnsavedChangesReminder.tsx
export function UnsavedChangesReminder() {
  return (
    <div className="px-6 py-2 text-xs text-amber-700 bg-amber-50 border-t border-amber-200">
      You have unsaved changes. Submit the form to save.
    </div>
  );
}
```

---

## Dashboard page

Available zones: `header`, `content`, `footer`.

### Replace the header with a custom title and date picker

```yaml
pages:
  - key: analytics-dashboard
    type: dashboard
    title: Analytics
    path: /analytics
    slotBindings:
      - slot: header
        primitive: dashboard-header
        props:
          subtitle: "Live data. Refreshes every 60 seconds."
```

```typescript
// primitives/dashboard-header/DashboardHeader.tsx
import { useState } from 'react';
import type { SlotContext } from '@ikary/cell-primitives';

interface DashboardHeaderProps {
  subtitle?: string;
  __slotContext?: SlotContext;
}

export function DashboardHeader({ subtitle, __slotContext }: DashboardHeaderProps) {
  const [range, setRange] = useState('7d');

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b">
      <div>
        <h1 className="text-xl font-semibold">{__slotContext?.pageTitle}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <select
        value={range}
        onChange={(e) => setRange(e.target.value)}
        className="h-8 rounded-md border px-3 text-sm"
      >
        <option value="1d">Last 24h</option>
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
      </select>
    </div>
  );
}
```

---

### Prepend an alert summary above dashboard content

```yaml
slotBindings:
  - slot: content.before
    primitive: alert-summary
    props:
      severity: warning
```

```typescript
// primitives/alert-summary/AlertSummary.tsx
interface AlertSummaryProps {
  severity: 'info' | 'warning' | 'error';
}

export function AlertSummary({ severity }: AlertSummaryProps) {
  const colors: Record<string, string> = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    error: 'bg-red-50 text-red-800 border-red-200',
  };

  return (
    <div className={`px-6 py-3 border-b text-sm ${colors[severity]}`}>
      3 active alerts require attention.
    </div>
  );
}
```

---

### Replace dashboard content entirely

```yaml
slotBindings:
  - slot: content
    primitive: kpi-dashboard
```

```typescript
// primitives/kpi-dashboard/KpiDashboard.tsx
export function KpiDashboard() {
  return (
    <div className="grid grid-cols-3 gap-6 p-6">
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Total Revenue</p>
        <p className="text-2xl font-semibold mt-1">$84,200</p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Active Users</p>
        <p className="text-2xl font-semibold mt-1">1,204</p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Open Tickets</p>
        <p className="text-2xl font-semibold mt-1">17</p>
      </div>
    </div>
  );
}
```

The default content placeholder no longer renders. `kpi-dashboard` fills the entire content zone.

---

## Custom page

Custom pages have a single `content` zone. Set `primitive` on the page to render a registered primitive as the page body.

### Full page via blank-slot

Use `blank-slot` as the page primitive when you want to compose the content entirely from slot bindings.

```yaml
pages:
  - key: announcements
    type: custom
    title: Announcements
    path: /announcements
    primitive: blank-slot
    slotBindings:
      - slot: content
        primitive: announcement-feed
```

```typescript
// primitives/announcement-feed/AnnouncementFeed.tsx
export function AnnouncementFeed() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Announcements</h1>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li>v2.1 released — see release notes.</li>
        <li>Scheduled maintenance on Friday at 02:00 UTC.</li>
      </ul>
    </div>
  );
}
```

---

### Stacking prepend and append around blank-slot

```yaml
pages:
  - key: help-center
    type: custom
    title: Help Center
    path: /help
    primitive: blank-slot
    slotBindings:
      - slot: content.before
        primitive: help-search-bar
      - slot: content.before
        primitive: help-categories
      - slot: content.after
        primitive: help-footer-links
```

Both `content.before` bindings render in order: `help-search-bar` appears first, then `help-categories`. `help-footer-links` renders after the (empty) body.

---

### Clearing a built-in zone with blank-slot

Use `blank-slot` to suppress an existing zone on an entity page.

```yaml
pages:
  - key: products-list
    type: entity-list
    title: Products
    path: /products
    entity: product
    slotBindings:
      - slot: toolbar
        primitive: blank-slot
      - slot: toolbar.after
        primitive: custom-search-bar
```

`blank-slot` replaces the default toolbar content. `custom-search-bar` appends after the now-empty zone. The result is that only `custom-search-bar` renders in the toolbar area.

---

## Using slotMode and slotZone in a primitive

A single primitive can adapt its appearance based on where it is placed.

```typescript
// primitives/context-banner/ContextBanner.tsx
import type { SlotContext } from '@ikary/cell-primitives';

interface ContextBannerProps {
  message: string;
  __slotContext?: SlotContext;
}

export function ContextBanner({ message, __slotContext }: ContextBannerProps) {
  const zone = __slotContext?.slotZone ?? 'unknown';
  const mode = __slotContext?.slotMode ?? 'replace';

  const borderClass =
    mode === 'prepend' ? 'border-b' :
    mode === 'append'  ? 'border-t' :
                         'border-y';

  return (
    <div className={`px-6 py-2 text-sm bg-muted ${borderClass}`}>
      <span className="text-muted-foreground">[{zone}]</span> {message}
    </div>
  );
}
```

Bind the same primitive at different zones:

```yaml
slotBindings:
  - slot: header.before
    primitive: context-banner
    props:
      message: "Shown above the header."
  - slot: footer.after
    primitive: context-banner
    props:
      message: "Shown below the footer."
```

When rendered in `header.before`, `slotMode` is `"prepend"` and `slotZone` is `"header"`. When rendered in `footer.after`, they are `"append"` and `"footer"`.
