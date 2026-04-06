# DetailItem Contract

Version: 1.0  
Scope: ikary-ui  
Status: Mandatory

This document defines the canonical `DetailItem` primitive for Ikary.

`DetailItem` is the atomic read-only display primitive used inside `DetailSection` and other approved read surfaces.

It is the canonical way to render one labeled value in read mode.

Custom label/value rendering is forbidden unless system-approved.

---

# 1. Philosophy

`DetailItem` exists to make single values:

- Clear
- Readable
- Consistent
- Scannable
- Enterprise-oriented

A read-only value must not feel like:

- a disabled input
- a random text block
- an unstructured database dump
- decorative UI

`DetailItem` exists to make one value understandable in context.

---

# 2. Primitive Goal

`DetailItem` is the canonical atomic read-only display primitive.

It standardizes:

- visible label
- value presentation
- empty-state presentation
- value formatting
- alignment rhythm
- type-based rendering rules
- accessibility basics for read surfaces

`DetailItem` does not own:

- section grouping
- edit behavior
- page shell behavior
- routing logic
- history or audit logic
- form lifecycle

`DetailItem` does not replace `DetailSection`.

---

# 3. Relationship to Other Primitives

## 3.1 Relationship to DetailSection

`DetailSection` is the read-only grouping primitive.

`DetailItem` is the canonical inner display unit inside `DetailSection`.

Recommended composition:

DetailSection  
 └── DetailItem[]

Ad hoc label/value row implementations inside `DetailSection` are forbidden.

## 3.2 Relationship to IkaryForm

`DetailItem` is the read-mode counterpart to `FormField`.

Recommended symmetry:

- read mode → `DetailItem`
- edit mode → `FormField`

Where practical, labels and business grouping should remain aligned between read mode and edit mode.

---

# 4. When to Use

Use `DetailItem` when rendering a single read-only value such as:

- text
- date
- datetime
- boolean
- status
- badge list
- tag list
- user reference
- entity reference
- link
- short list summary
- multiline text

Do not use `DetailItem` for:

- large tabular collections
- audit timelines
- diff viewers
- complex chart or visualization content
- form controls

---

# 5. Canonical Structure

Mandatory structure:

DetailItem  
 ├── Label  
 └── Value

Optional supporting internal elements may exist depending on type, but the visible primitive must always resolve to:

- one visible label
- one visible value area

The structure must remain stable across all entities.

---

# 6. Label Rules

Every `DetailItem` must have a visible label.

Label must:

- be concise
- clearly identify the value
- remain visible
- be left-aligned
- use approved label typography
- remain consistent with sibling items

Good examples:

- Project Name
- Status
- Owner
- Created At

Bad examples:

- Info
- Data
- More
- Value 1

Label must not:

- be hidden for visual convenience
- rely on placeholder-like styling
- be replaced by icon-only meaning

---

# 7. Value Rules

Every `DetailItem` must have a value area.

The value area must:

- be readable
- preserve layout stability
- format content according to type
- wrap predictably when long
- remain visually distinct from the label
- avoid mimicking editable controls

Value must not render like a disabled input.

Read mode must look like read mode.

---

# 8. Approved Value Kinds

`DetailItem` supports only approved value kinds.

## 8.1 text

Use for standard short textual values.

Examples:

- project name
- code
- country
- city

## 8.2 long-text

Use for longer descriptive values.

Examples:

- description
- notes
- summary

Must wrap predictably and remain readable.

## 8.3 date

Use for calendar-based values.

Examples:

- due date
- birth date
- start date

## 8.4 datetime

Use for timestamp values.

Examples:

- created at
- updated at
- last synced at

## 8.5 boolean

Use for yes/no or enabled/disabled state.

Examples:

- Enabled
- Approved
- Archived

Boolean values must be rendered explicitly, not implied by color only.

## 8.6 status

Use for lifecycle or workflow state.

Examples:

- Draft
- Active
- Pending Review
- Archived

Status may use badge treatment if that is the approved system style.

## 8.7 badge-list

Use for short categorical or tag-like values.

Examples:

- Tags
- Categories
- Roles

## 8.8 link

Use for navigable URLs or approved internal references.

Examples:

- Website
- Documentation
- External Link

## 8.9 user-reference

Use for user identity display.

Examples:

- Owner
- Created By
- Approved By

## 8.10 entity-reference

Use for linked entity display.

Examples:

- Customer
- Team
- Workspace
- Parent Project

## 8.11 list-summary

Use for short summarized lists.

Examples:

- Assigned Teams
- Supported Regions
- Notification Channels

Use only for small or summarized collections.

---

# 9. Formatting Rules by Kind

Formatting must be type-aware and consistent.

## 9.1 text

- render plainly
- preserve readability
- avoid truncation unless approved by layout pattern

## 9.2 long-text

- allow wrapping
- preserve paragraph readability
- avoid overly narrow columns

## 9.3 date / datetime

- use one canonical system formatting style
- remain locale-consistent across the app
- do not mix date formatting styles within the same product surface

## 9.4 boolean

Allowed examples:

- Yes / No
- Enabled / Disabled
- True / False only when domain-appropriate

Do not communicate boolean state by color alone.

## 9.5 status

- must use approved status semantics
- must not rely on color only
- wording must be domain-meaningful

## 9.6 badge-list

- keep badge density under control
- wrap predictably if needed
- do not create visual clutter

## 9.7 link

- must remain clearly identifiable as a link
- long URLs should not degrade readability
- external vs internal navigation must follow system rules

## 9.8 references

- user and entity references should display meaningful names, not opaque ids where avoidable
- ids may be secondary or fallback content where needed

---

# 10. Empty Value Rules

Empty values must be handled consistently.

Allowed patterns:

- `—`
- `Not set`
- domain-meaningful empty text when needed

Rules:

- empty values must remain subtle
- empty values must not silently disappear when the label still matters
- empty rendering must not break alignment
- empty values must not look like errors unless they truly represent an error state

Do not hide a `DetailItem` only because its value is empty unless the parent contract explicitly allows omission.

---

# 11. Loading Behavior

If an item loads independently:

- label should remain visible when possible
- value area may use a lightweight skeleton or placeholder
- layout must remain stable

Item loading must not make the surrounding section feel broken.

Do not block the whole section for one simple value unless the parent surface requires it.

---

# 12. Error Behavior

If an item fails to load independently:

- preserve the label
- show a concise inline error in the value area
- keep the error local
- allow retry only if that pattern is supported by the parent surface

Item-level error should remain rare.

Most data-loading errors should usually be handled at section or page level unless item-level loading is genuinely independent.

---

# 13. Alignment and Layout Rules

Within a `DetailSection`, sibling `DetailItem` instances must preserve consistent alignment rhythm.

Rules:

- labels align consistently
- value areas align consistently
- vertical spacing remains stable
- multiline values must not break section readability
- label/value proportions must not vary arbitrarily between siblings

The precise visual implementation may differ between `field-list` and `field-grid`, but the item anatomy remains the same.

---

# 14. Accessibility

All `DetailItem` instances must satisfy the following.

## 14.1 Visible semantics

- label must remain visible
- value must remain readable without relying on decoration only

## 14.2 Reading order

DOM order must remain logical:

- label
- value

## 14.3 Links and references

If the value is interactive, it must remain clearly accessible and keyboard-usable according to system standards.

## 14.4 Status and boolean readability

Status and boolean values must not rely on color alone.

---

# 15. Forbidden Patterns

Forbidden:

- hidden labels
- disabled inputs used as read-only display
- raw JSON as a value presentation
- inconsistent empty-state handling
- color-only boolean or status communication
- arbitrary custom label/value markup outside the primitive
- truncation that hides critical business meaning
- rendering opaque ids as the primary display value when a meaningful name exists
- overloading one item with large collection content

---

# 16. Definition of Done

A `DetailItem` is compliant if:

- it has a visible label
- it has a readable value area
- value kind is one of the approved kinds
- formatting matches the kind consistently
- empty values are handled predictably
- read-only presentation does not mimic editable controls
- alignment remains consistent with sibling items
- accessibility basics are implemented
- no forbidden pattern is used

---

# 17. Canonical Examples

## 17.1 text

Label:
`Project Name`

Value:
`Customer Intelligence Platform`

## 17.2 datetime

Label:
`Last Updated At`

Value:
`2026-03-12 14:32`

## 17.3 boolean

Label:
`Audit Logging Enabled`

Value:
`Yes`

## 17.4 status

Label:
`Status`

Value:
`Pending Review`

## 17.5 entity-reference

Label:
`Workspace`

Value:
`Revenue Operations`

## 17.6 empty

Label:
`Secondary Approver`

Value:
`—`

## 17.7 long-text

Label:
`Description`

Value:
`Internal platform used to manage customer data workflows and approval processes.`

---

# 18. Final Rule

If a value looks visually neat but weakens read-mode clarity, it is non-compliant.

Readability, explicit labeling, and consistent formatting take priority over stylistic variation.
