# DetailSection Contract

Version: 1.0  
Scope: ikary-ui  
Status: Mandatory

This document defines the canonical `DetailSection` primitive for Ikary.

`DetailSection` is the structural read-only grouping primitive used inside `DetailPage` and other approved read surfaces.

It is the canonical way to present grouped entity information in read mode.

Custom read-only section layout is forbidden unless system-approved.

---

# 1. Philosophy

`DetailSection` exists to make entity information:

- Clear
- Structured
- Scannable
- Calm
- Enterprise-oriented

A read surface must not feel like raw database output.

A section must help users understand:

- what this group of information is about
- why these values belong together
- where one concern ends and another begins

A section must never feel decorative.

---

# 2. Primitive Goal

`DetailSection` is the canonical grouping wrapper for read-only entity information.

It standardizes:

- section heading hierarchy
- optional section description
- read-only field grouping
- section spacing
- section boundaries
- approved layout variants
- empty-state presentation at section level
- optional secondary section actions when explicitly approved

`DetailSection` does not own:

- page routing
- top-level tabs
- page-level governance
- edit lifecycle
- draft or commit behavior

`DetailSection` does not replace `DetailPage`.

---

# 3. Relationship to DetailPage

`DetailPage` owns:

- header
- promoted metadata row
- top-level tabs
- governance tabs
- rollback and audit surfaces
- path-based routing

`DetailSection` owns:

- read-mode grouping inside the active tab
- section heading
- optional section description
- read-only information layout
- section-level scanability

The promoted metadata row in `DetailPage` header is not part of `DetailSection`.

In `Overview` read mode, entity information must be rendered using `DetailSection[]`.

Ad hoc read-only field grids are forbidden.

---

# 4. Relationship to IkaryForm

`DetailSection` is the read-mode counterpart to `FormSection`.

Recommended pairing:

- `Overview` read mode → `DetailSection[]`
- `Overview` edit mode → `IkaryForm`
  - `FormSection[]`
  - `FormField[]`

Where practical, read mode and edit mode should preserve similar business grouping.

The user should not feel that the entity is organized one way in read mode and a completely different way in edit mode without strong reason.

---

# 5. When to Use

Use `DetailSection` when:

- multiple values belong to the same business topic
- the read surface needs clear grouping
- an entity has more than one meaningful concern
- a section needs a visible title and optional explanation
- a detail view would become harder to scan without grouping

Examples:

- General Information
- Ownership
- Access Control
- Contact Details
- Billing Information
- Notification Rules
- Audit Metadata

Do not use `DetailSection` for decorative spacing only.

---

# 6. Canonical Structure

Mandatory structure:

DetailSection  
 ├── SectionHeader  
 │ ├── Title  
 │ ├── Description (optional)  
 │ └── SectionAction (optional, restricted)  
 └── SectionBody  
 └── ReadOnlyItems

Rules:

- section header always appears before section body
- title is always visible
- description is optional
- section body contains grouped read-only information
- section action is optional and strictly secondary

The structure must remain stable across all entities.

---

# 7. Section Header Rules

## 7.1 Title

Every `DetailSection` must have a visible title.

Title must:

- be concise
- clearly describe the business group
- be left-aligned
- use approved section heading typography
- remain visible at all times

Good examples:

- General Information
- Access Control
- Contact Details
- Status and Ownership

Bad examples:

- Stuff
- Other
- More Info
- Block 2

## 7.2 Description

Description is optional.

Description must:

- appear below the title
- explain the purpose or business meaning of the group
- remain concise
- use approved supporting text typography

Good example:

`Key information that identifies the project and explains its current business status.`

Description must not:

- duplicate the values shown below
- contain validation language
- contain temporary system status
- replace field-level explanations that belong elsewhere

---

# 8. Section Body Rules

The section body contains grouped read-only information.

Allowed contents include:

- canonical label/value display rows
- canonical read-only badges and statuses
- canonical read-only lists
- canonical read-only links
- approved nested read-only display primitives

Section body must:

- preserve consistent spacing
- preserve a clear reading order
- remain easy to scan
- avoid arbitrary visual nesting
- prioritize clarity over density

Section body must not:

- render as raw JSON
- collapse into an unstructured text block
- mix unrelated display styles without reason
- behave like an edit form

`DetailSection` is a read surface, not a pseudo-form.

---

# 9. Approved Layout Variants

`DetailSection` supports only approved layout variants.

## 9.1 Stack

Default layout.

Use when:

- values vary in height
- content includes long text
- readability is more important than density
- the section contains complex or heterogeneous values

## 9.2 TwoColumn

Allowed only when:

- values are short enough
- left/right pairing improves scanability
- labels remain aligned and readable
- the section remains visually balanced

Examples:

- First Name / Last Name
- Owner / Status
- Start Date / End Date
- City / Postal Code

Two-column layout must not be used for:

- long rich text values
- large lists
- heavy multi-line values
- visually unbalanced content types
- mixed values that become harder to scan side by side

`stack` is the default and preferred mode.

---

# 10. Read-Only Value Presentation Rules

Within a section, values must be displayed clearly and consistently.

Each read-only item should communicate:

- label
- value
- optional supporting visual treatment when appropriate

Examples of valid value presentations:

- plain text
- dates
- user references
- status badge
- external/internal links
- tag lists
- short list summaries
- boolean state labels

Rules:

- label must remain visible
- value must be readable
- labels and values must align consistently within the section
- value formatting must match the value type
- long content must wrap predictably
- empty values must not collapse the layout unpredictably

Read-only presentation must never mimic editable inputs.

---

# 11. Empty Value Rules

Empty values must be handled consistently.

Allowed patterns:

- explicit empty token such as `—`
- explicit empty-state label such as `Not set`
- approved null-state text when business meaning requires it

Rules:

- empty presentation must be visually subtle
- empty values must not disappear silently when the label still matters
- empty values must not break alignment rhythm

Do not hide a field only because its value is empty unless the page contract explicitly allows omission for that field group.

---

# 12. Section-Level Empty State

A section may be empty when the underlying entity has no meaningful values for that group.

If a section is intentionally empty:

- the title must still be visible
- the body must show a clear empty-state message
- the empty state must be concise and non-decorative

Example:

`No notification rules configured.`

Section-level empty states must not feel like system errors.

---

# 13. Secondary Section Actions

Section actions are optional and restricted.

Examples of valid section actions:

- Edit
- View More
- Open Related Record
- Expand

Section actions must:

- appear in the header area
- remain visually secondary to the section title
- be truly section-specific
- not compete with page-level primary actions

Section actions must not:

- become the main save/edit mechanism for the page
- duplicate top-level page actions without reason
- overload the header
- introduce unrelated business logic

If no meaningful section action exists, none should be rendered.

---

# 14. Collapsible Behavior

Collapsible behavior is optional and must be used intentionally.

Use collapsible sections only when:

- the read surface is long enough to justify progressive disclosure
- the section title remains meaningful when collapsed
- critical information is not hidden by default

Collapsible sections must:

- preserve keyboard accessibility
- expose expanded/collapsed state semantically
- remain predictable
- not replace good information architecture

High-value or frequently consulted sections should remain expanded by default.

---

# 15. Status and Badge Presentation

Sections may contain status-like values, but status presentation must remain inside the section body unless the page contract explicitly promotes them elsewhere.

Examples:

- Status badge
- Ownership role
- Lifecycle state
- Risk level

Rules:

- status values must use approved visual semantics
- status must not rely on color only
- status formatting must be consistent across entities
- promoted page header metadata must not be duplicated unnecessarily inside the section

---

# 16. Relationship and List Values

A `DetailSection` may contain relationship-based values such as:

- linked entity references
- small related lists
- assigned users
- tags
- categories

Rules:

- short relationship values may render inline
- larger related collections must not be forced into a cramped label/value row
- if a related collection becomes substantial, use an approved nested read-only primitive or dedicated tab content
- the section must remain scannable

Do not overload a single `DetailSection` with large table-like data if a dedicated list surface is more appropriate.

---

# 17. Loading Behavior

Section loading behavior must remain calm and local.

If a section loads independently:

- keep the section title visible
- use skeletons or placeholder rows inside the section body
- preserve section spacing and structure
- avoid blocking the whole page unless the page contract requires it

Loading must not make the section appear broken.

---

# 18. Error Behavior

If a section fails to load independently:

- show an inline section error
- keep the title visible
- allow retry where appropriate

Section error must:

- remain local to the section
- be clear and concise
- not escalate to full page error unless the parent surface decides so

A section error must not erase the section identity.

---

# 19. Accessibility

All `DetailSection` instances must satisfy the following.

## 19.1 Heading semantics

Section title must use the correct heading level relative to the page hierarchy.

Do not skip heading levels arbitrarily.

## 19.2 Reading order

The DOM order must remain logical:

- title
- description
- optional action
- body content in reading order

Visual layout must not break logical reading order.

## 19.3 Value readability

Labels and values must remain understandable without relying on visual decoration alone.

## 19.4 Collapsible semantics

If collapsible:

- expanded state must be exposed semantically
- toggle control must be keyboard accessible
- collapsed content must be hidden appropriately from assistive technology

---

# 20. Layout and Spacing Rules

Section spacing must be consistent across the page.

Rules:

- section header and body use approved spacing tokens
- distance between sections must be greater than distance between items inside a section
- titles align consistently across sibling sections
- internal label/value rhythm must remain stable
- ad hoc per-entity spacing overrides are forbidden

A `DetailSection` should feel structurally consistent across all Cells.

---

# 21. Forbidden Patterns

Forbidden:

- section without visible title
- decorative section wrappers with no business meaning
- ad hoc field grids outside `DetailSection` in Overview read mode
- rendering read mode as disabled form controls
- raw JSON presentation
- hiding labels for readability convenience
- two-column layout for long or complex values
- unrelated values grouped together
- section used only as a spacer
- overloading a section with large collection data better suited to a list surface
- hidden empty values that break layout consistency
- inconsistent heading hierarchy
- section action used as primary page action

---

# 22. Definition of Done

A `DetailSection` is compliant if:

- it has a visible title
- description, when present, appears below the title
- values are grouped by real business meaning
- layout uses an approved variant
- labels remain visible and aligned consistently
- values are readable and appropriately formatted
- empty values are handled consistently
- section spacing follows system tokens
- optional actions remain secondary and relevant
- accessibility requirements are implemented
- no forbidden pattern is used

---

# 23. Canonical Examples

## 23.1 Standard read section

Title:
`General Information`

Description:
`Core business information used to identify and classify the project.`

Body:

- Name
- Code
- Status
- Owner

Layout:

- stack

## 23.2 Two-column read section

Title:
`Contact Details`

Description:
`Primary contact information for operational follow-up.`

Body:

- First Name
- Last Name
- Email
- Phone Number

Layout:

- two-column

## 23.3 Empty section

Title:
`Notification Rules`

Description:
`Configured alert and escalation settings for this entity.`

Body:

- `No notification rules configured.`

Layout:

- stack

## 23.4 Relationship-oriented section

Title:
`Ownership`

Description:
`People and teams responsible for this record.`

Body:

- Primary Owner
- Approver
- Linked Team
- Tags

Layout:

- stack

---

# 24. Final Rule

If a section looks visually neat but weakens read-mode clarity, it is non-compliant.

Structure, readability, and semantic grouping take priority over stylistic variation.
