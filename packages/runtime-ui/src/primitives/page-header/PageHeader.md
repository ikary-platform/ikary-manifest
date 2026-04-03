# Page Header Contract

**Version:** 1.0  
**Scope:** ikary-ui  
**Status:** Mandatory

---

This document defines the canonical **PageHeader** primitive for IKARY.

PageHeader is the standard top-of-page identity and action container used across route-level pages.

Think:

```
Page -> PageHeader
```

PageHeader is used to communicate:

- page identity
- page context
- page-level actions
- optional navigation context

PageHeader is not responsible for:

- list filtering
- list search orchestration
- bulk selection actions
- collection pagination
- entity-specific inline workflows

Those belong to other primitives.

---

## 1. Philosophy

PageHeader is the canonical top section of an application page.

It must be:

- Clear
- Structured
- Premium
- Enterprise-oriented
- Accessible
- Non-creative

PageHeader exists to answer three questions immediately:

- Where am I?
- What is this page about?
- What can I do at page level?

PageHeader must not become a catch-all toolbar.

---

## 2. Responsibility Boundary

### 2.1 PageHeader owns

PageHeader is responsible for:

- page title
- page description
- page-level actions
- optional breadcrumbs
- optional metadata row
- optional lower slot for tabs or secondary content
- responsive arrangement of those elements

### 2.2 PageHeader does not own

PageHeader must not own:

- list filters
- list search behavior
- bulk actions
- pagination
- route fetching
- entity selection
- detail form logic

---

## 3. Canonical Structure

Canonical structure:

```
PageHeader
  ├── Top Row (optional)
  │    └── Breadcrumbs
  │
  ├── Main Row
  │    ├── Identity Block
  │    │    ├── Eyebrow (optional)
  │    │    ├── Title
  │    │    ├── Description (optional)
  │    │    └── Metadata Row (optional)
  │    │
  │    └── Action Block (optional)
  │         ├── Secondary Actions
  │         └── Primary Action
  │
  └── Bottom Slot (optional)
       ├── Tabs
       ├── Secondary navigation
       └── Summary strip
```

---

## 4. Title Rules

Title is mandatory.

Title must:

- uniquely identify the current page
- be visible at all times
- use semantic heading markup
- not be replaced by placeholder-only UI

Title should be short and direct.

Good examples: Customers, Customer Details, Billing, API Keys, Workspace Settings.

Bad examples: "Manage all the things related to customers", "Dashboard for customer administration and workflows".

---

## 5. Description Rules

Description is optional.

Description should:

- provide short context
- explain what the page is for
- remain concise
- usually fit in one or two lines

Description must not become a paragraph of documentation.

---

## 6. Eyebrow Rules

Eyebrow is optional.

Eyebrow is used for lightweight context above the title.

Examples: Workspace, Settings, Administration, Billing, AI.

Eyebrow should be visually subtle and never compete with the title.

---

## 7. Breadcrumb Rules

Breadcrumbs are optional.

Use breadcrumbs when:

- the page is part of a navigational hierarchy
- parent context matters
- users benefit from upward navigation

Do not use breadcrumbs when the page already sits in obvious top-level navigation and the hierarchy adds no value.

Breadcrumbs must appear above the identity block.

---

## 8. Metadata Row

Metadata row is optional.

It may include:

- status badge
- environment badge
- tenant/workspace label
- last updated information
- entity count summary
- ownership label

Metadata must be:

- concise
- secondary in emphasis
- non-interactive by default
- rendered using shared wrappers

Metadata row must not become an action bar.

---

## 9. Actions

PageHeader supports page-level actions only.

Examples: Create, Import, Export, Refresh, Save, Publish, Connect.

Actions must apply to the page as a whole.

Actions must not be:

- bulk actions for selected rows
- row-specific actions
- filter controls disguised as actions

### 9.1 Action limits

Recommended baseline:

- maximum 1 primary action
- maximum 3 visible secondary actions
- overflow menu for additional actions

### 9.2 Action hierarchy

Actions must follow this order:

- secondary actions first
- primary action last
- destructive actions should generally live in overflow unless the page context clearly requires otherwise

---

## 10. Lower Slot

PageHeader may expose an optional lower slot.

Use this slot for:

- tabs
- sub-navigation
- compact summary strip
- contextual page-level helper content

Do not use this slot for:

- list filter bars
- bulk selection bars
- dense control toolbars

---

## 11. Visual Style Rules

PageHeader should feel:

- premium
- calm
- modern
- serious
- clean

Recommended baseline visual rules:

- soft rounded container or clean section boundary
- restrained border treatment
- subtle background contrast if the page needs separation
- large, confident title
- short muted description
- balanced spacing between identity and actions
- no decorative hero graphics
- no marketing-style gradients as core behavior

The page header should feel like a serious app surface, not a landing page hero.

---

## 12. Responsive Behavior

PageHeader must adapt responsively.

Rules:

- breadcrumbs remain above the title
- identity block stacks naturally
- actions move below or wrap in a controlled row
- primary action remains visually prominent
- metadata wraps cleanly
- lower slot remains separated from the main identity row

Responsive collapse must remain predictable.

---

## 13. Accessibility

PageHeader must be accessible by default.

It must support:

- semantic heading structure
- accessible breadcrumb labels
- accessible action labels
- visible focus states
- meaningful button hierarchy
- proper landmark usage where appropriate

Title must use proper heading markup.

---

## 14. Authorization Awareness

PageHeader must respect permissions.

Permission-sensitive behavior may include:

- visibility of primary action
- visibility of secondary actions
- read-only page state
- disabled action states

Authorization rules must remain declarative.

---

## 15. Observability

PageHeader should participate in page-level observability.

Recommended events:

- `page_header_action_clicked`
- `page_header_breadcrumb_clicked`
- `page_header_tab_changed`

Recommended payload:

- `route`
- `workspaceId`
- `cellId`
- `entityType`
- `actionKey`
- `pageKey`

---

## 16. Forbidden Patterns

The following are forbidden:

- putting list filters into PageHeader as the default IKARY model
- mixing page actions and bulk actions
- more than one primary action
- verbose paragraph-like descriptions
- ad hoc page header implementations
- decorative hero banner behavior
- embedding complex workflows directly in the header
- hiding title hierarchy for purely visual reasons

---

## 17. Recommended Defaults

Unless explicitly configured otherwise:

- title is required
- description is optional
- eyebrow is optional
- breadcrumbs are optional
- metadata row is optional
- one primary action maximum
- secondary actions are compact
- lower slot is empty by default

---

## 18. Definition of Done

A PageHeader is compliant if:

- it uses the shared primitive
- title is always present
- actions are page-level only
- action hierarchy is respected
- filters are not embedded as canonical header behavior
- responsive layout is predictable
- accessibility is respected
- permissions are respected
- no forbidden patterns are used

---

## 19. Canonical Summary

The PageHeader is the canonical top-of-page identity and page-action primitive for IKARY.

**It owns:**

- title
- description
- breadcrumbs
- metadata
- page-level actions
- optional lower slot

**It does not own:**

- filtering
- search
- pagination
- bulk actions
- list orchestration

The canonical primitive separation is:

```
PageHeader      =  identity + page actions
FilterBar       =  search + filters + view toggle
BulkCommandBar  =  selection actions
```

---

## 20. React Primitive

A practical primitive for a shadcn-style codebase.

```tsx
import * as React from 'react';
import { ChevronRight, MoreHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type MetaItem = {
  key: string;
  label: React.ReactNode;
};

type HeaderAction = {
  key: string;
  label: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  disabled?: boolean;
};

export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  meta?: MetaItem[];
  primaryAction?: HeaderAction;
  secondaryActions?: HeaderAction[];
  lowerSlot?: React.ReactNode;
  className?: string;
}

function ActionButton({ action }: { action: HeaderAction }) {
  const variant = action.variant ?? 'secondary';

  if (action.href) {
    return (
      <Button asChild variant={variant} disabled={action.disabled}>
        <a href={action.href}>{action.label}</a>
      </Button>
    );
  }

  return (
    <Button variant={variant} onClick={action.onClick} disabled={action.disabled}>
      {action.label}
    </Button>
  );
}

function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-3">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1">
              {item.href && !isLast ? (
                <a
                  href={item.href}
                  className="rounded-sm outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.label}
                </a>
              ) : (
                <span className={cn(isLast && 'text-foreground')}>{item.label}</span>
              )}

              {!isLast && <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function PageHeader({
  title,
  description,
  eyebrow,
  breadcrumbs = [],
  meta = [],
  primaryAction,
  secondaryActions = [],
  lowerSlot,
  className,
}: PageHeaderProps) {
  const visibleSecondary = secondaryActions.slice(0, 3);
  const overflowSecondary = secondaryActions.slice(3);

  return (
    <header className={cn('rounded-2xl border bg-card/70 px-5 py-5 shadow-sm', 'md:px-6 md:py-6', className)}>
      {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          {eyebrow ? (
            <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {eyebrow}
            </div>
          ) : null}

          <div className="flex min-w-0 items-start gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>

              {description ? (
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">{description}</p>
              ) : null}

              {meta.length > 0 ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {meta.map((item) => (
                    <Badge key={item.key} variant="secondary" className="rounded-md px-2.5 py-1 font-normal">
                      {item.label}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {(visibleSecondary.length > 0 || primaryAction || overflowSecondary.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {visibleSecondary.map((action) => (
              <ActionButton key={action.key} action={action} />
            ))}

            {overflowSecondary.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="More actions">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {overflowSecondary.map((action) => (
                    <DropdownMenuItem
                      key={action.key}
                      onClick={action.onClick}
                      disabled={action.disabled}
                      asChild={!!action.href}
                    >
                      {action.href ? <a href={action.href}>{action.label}</a> : <span>{action.label}</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {primaryAction ? (
              <ActionButton
                action={{
                  ...primaryAction,
                  variant: primaryAction.variant ?? 'default',
                }}
              />
            ) : null}
          </div>
        )}
      </div>

      {lowerSlot ? <div className="mt-5 border-t pt-4">{lowerSlot}</div> : null}
    </header>
  );
}
```

### Visual recipe

Locked visual tokens for IKARY:

- **Container:** `rounded-2xl border bg-card/70 shadow-sm`
- **Spacing:** `px-5 py-5` mobile, `px-6 py-6` desktop
- **Eyebrow:** tiny uppercase with wide tracking
- **Title:** `text-2xl` mobile, `text-3xl` desktop, semibold, tight tracking
- **Description:** muted, `max-w-3xl`
- **Meta:** compact secondary badges
- **Actions:** compact row on desktop, stack/wrap on smaller widths
- **Lower slot:** thin top border separator for tabs or summary strip
