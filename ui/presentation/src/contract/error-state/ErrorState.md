# ErrorState Contract

**Version:** 1.0  
**Scope:** micro-app-ui  
**Status:** Mandatory

This document defines the canonical `ErrorState` primitive for Micro OS.

`ErrorState` is used when a surface cannot render or complete successfully because an operation failed.

> It is not an empty result. It is not a loading state. It is not a validation message. Failure is a normal system condition, but it must be communicated with clarity and restraint.

---

## 1. Philosophy

`ErrorState` exists to communicate failure clearly, safely, and with user recovery in mind.

It should:

- Acknowledge that something failed
- Explain the issue at the right level of abstraction
- Preserve user trust
- Guide the user toward a useful next step where possible
- Remain reusable across all runtime surfaces

---

## 2. Usage

`ErrorState` may be used in:

- Full pages
- List regions
- Detail panels
- Relation sections
- Tabs
- Cards
- Widgets
- Inline async blocks
- Embedded runtime surfaces

**Examples:**

- A page failed to load
- A section dependency failed
- A related collection could not be retrieved
- A widget request failed
- A tab content fetch failed
- A refresh attempt failed
- A requested resource does not exist

---

## 3. When to Use

**Use `ErrorState` when:**

- A fetch failed
- A runtime dependency failed
- A surface could not resolve
- An async operation failed
- A requested resource is missing
- Retryable loading failed

**Do not use `ErrorState` when:**

- The request succeeded but returned no data
- The surface is still loading
- A form field is invalid
- The user lacks authorization and a dedicated unauthorized state exists
- The feature is intentionally unavailable

Those conditions must use their own canonical states.

---

## 4. Visual Structure

```
ErrorState
  ├── optional icon
  ├── title
  ├── optional description
  ├── optional primary recovery action
  ├── optional secondary action
  └── optional technical details (guarded)
```

`ErrorState` must remain readable, calm, and actionable.

---

## 5. Core Principles

### 5.1 Human-first messaging

`ErrorState` should speak to the user, not to internal systems.

| ✅ Prefer            | ❌ Avoid                          |
| -------------------- | --------------------------------- |
| Clear titles         | Raw stack traces                  |
| Concise descriptions | Framework exceptions              |
| Recovery language    | Implementation jargon             |
|                      | Noisy debugging output by default |

---

### 5.2 Recovery-oriented

Whenever possible, `ErrorState` should help the user recover.

Typical recovery paths include:

- Retry
- Refresh
- Go back
- Navigate elsewhere
- Contact support
- Inspect details if appropriate

---

### 5.3 Scoped failure

If only a subsection failed, do not collapse the whole page unnecessarily. A local failure should remain local when possible. This preserves trust and usability.

---

### 5.4 Trust preservation

`ErrorState` must communicate honesty without panic.

It should feel calm, respectful, direct, and bounded. It must not feel catastrophic unless the failure is truly blocking.

---

## 6. Variants

| Variant      | Meaning                           |
| ------------ | --------------------------------- |
| `page`       | Whole page failed                 |
| `section`    | Subsection failed                 |
| `inline`     | Small embedded region failed      |
| `network`    | Request or network problem        |
| `unexpected` | Unknown or unclassified issue     |
| `notFound`   | Requested resource does not exist |

Variants may influence copy, icon treatment, and spacing, but not the core structure.

---

## 7. Severity

| Value      | When to use                                                                      |
| ---------- | -------------------------------------------------------------------------------- |
| `soft`     | A section failed but the page remains partially usable                           |
| `blocking` | The primary surface cannot continue and the user cannot proceed without recovery |

> Severity must reflect user impact, not internal technical drama.

---

## 8. Content Rules

### 8.1 Title

`title` is **required**. It must be short, clear, and human-readable.

| ✅ Examples                      |
| -------------------------------- |
| Unable to load customers         |
| Something went wrong             |
| This section could not be loaded |
| Invoice not found                |

Avoid vague low-value titles when a more specific one is possible.

---

### 8.2 Description

`description` is **optional but recommended**. It should help the user understand what happened and what to do next.

| ✅ Examples                                                            |
| ---------------------------------------------------------------------- |
| Try refreshing the page.                                               |
| Please retry in a moment.                                              |
| This section failed to load. You can retry without leaving the page.   |
| The requested invoice may have been deleted or is no longer available. |

Do not expose raw internal errors here.

---

### 8.3 Primary recovery action

A primary recovery action is **optional but strongly recommended** when recovery is possible.

| ✅ Examples    |
| -------------- |
| Retry          |
| Refresh        |
| Go back        |
| Return to list |

Primary actions should be clear and safe.

---

### 8.4 Secondary action

A secondary action is **optional**.

| ✅ Examples     |
| --------------- |
| Contact support |
| View details    |
| Open help       |
| Go to dashboard |

> Recommended maximum: one primary action and one secondary action.

---

## 9. Technical Details

Technical details are **optional and must be guarded**. They may include:

- Error code
- Correlation ID
- Request ID
- Support reference
- Sanitized technical message

Technical details must not be shown by default to ordinary users unless the runtime explicitly allows it.

**Never default to:**

- Stack traces
- SQL errors
- Internal paths
- Framework dump output
- Secrets
- Raw backend payloads

---

## 10. Not Found Semantics

`notFound` is a valid error variant. Use it when:

- An entity does not exist
- A route points to missing data
- A resource was deleted
- The identifier is valid in shape but not present in storage

| ✅ Examples             |
| ----------------------- |
| Customer not found      |
| Invoice not found       |
| Report no longer exists |

> `notFound` may still be rendered through the shared `ErrorState` primitive unless the platform has a dedicated page shell for not-found routes.

---

## 11. Accessibility

`ErrorState` must:

- Communicate failure through visible text
- Not rely only on color or iconography
- Ensure actions are keyboard accessible
- Preserve semantic clarity for assistive technologies
- Keep the recovery path understandable

If technical details can be expanded, that interaction must also be accessible.

---

## 12. Behavior

`ErrorState` should be recoverable where possible.

Recommended behavior:

- Show retry only when retry is safe
- Show scoped recovery when the failure is local
- Preserve surrounding usable UI when possible
- Avoid taking over the whole page for isolated minor failures

> `ErrorState` itself is descriptive and presentational. It must not own backend retry logic directly.

---

## 13. Canonical Schema Shape

```ts
type ErrorStatePresentation = {
  title: string;
  description?: string;
  icon?: string;
  variant?: 'page' | 'section' | 'inline' | 'network' | 'unexpected' | 'notFound';
  severity?: 'soft' | 'blocking';
  retryAction?: {
    label: string;
    actionKey?: string;
  };
  secondaryAction?: {
    label: string;
    actionKey?: string;
    href?: string;
  };
  technicalDetails?: {
    code?: string;
    correlationId?: string;
    message?: string;
  };
};
```

---

## 14. Field Semantics

### 14.1 `title`

Required human-readable error title.

### 14.2 `description`

Optional user-facing explanation or guidance.

### 14.3 `icon`

Optional icon identifier.

### 14.4 `variant`

Defines the semantic failure context.

### 14.5 `severity`

Defines whether the failure is local or blocking.

### 14.6 `retryAction`

Optional retry action. `retryAction.label` is required when `retryAction` is present.

### 14.7 `secondaryAction`

Optional secondary action. `secondaryAction.label` is required when `secondaryAction` is present.

> At least one of `actionKey` or `href` should be present when `secondaryAction` is provided.

### 14.8 `technicalDetails`

Optional guarded technical metadata for support and debug contexts.

---

## 15. Examples

### 15.1 Page load failure

```yaml
title: Unable to load customers
description: Try refreshing the page. If the issue continues, contact support.
variant: page
severity: blocking
retryAction:
  label: Retry
```

### 15.2 Embedded section failure

```yaml
title: Attachments could not be loaded
description: Retry this section without leaving the page.
variant: section
severity: soft
retryAction:
  label: Retry
```

### 15.3 Missing resource

```yaml
title: Invoice not found
description: The requested invoice may have been deleted or is no longer available.
variant: notFound
severity: blocking
secondaryAction:
  label: Return to invoices
  href: /invoices
```

### 15.4 Network issue

```yaml
title: Connection problem
description: The request could not be completed. Please try again.
variant: network
severity: soft
retryAction:
  label: Retry
```

---

## 16. Governance

`ErrorState` is a foundational runtime primitive.

All runtime failures should converge toward this primitive instead of inventing ad hoc alert layouts, banners, or custom failure blocks. Consistency is mandatory.

---

## 17. Implementation Notes

**Implementation should prefer:**

- Calm error presentation
- Clear hierarchy
- Minimal but useful action affordances
- Safe handling of technical details
- Reuse across page, section, card, tab, widget, and inline surfaces

**Implementation must avoid:**

- Custom one-off failure UIs
- Backend-specific rendering assumptions
- Leaking raw technical internals
- Over-dramatic visual treatment

> `ErrorState` is generic and reusable by design.
