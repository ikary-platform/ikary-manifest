# Form Section Contract

Version: 1.0  
Scope: ikary-ui  
Status: Mandatory

This document defines the canonical `FormSection` primitive for Ikary.

`FormSection` is the structural grouping primitive used to organize related `FormField` instances inside forms, detail pages, and edit surfaces.

`FormSection` must be used whenever a form contains multiple related fields that need shared hierarchy, spacing, and optional explanatory context.

Custom section layout is forbidden unless system-approved.

---

# 1. Section Philosophy

Form sections must be:

- Clear
- Structured
- Scannable
- Calm
- Enterprise-oriented

A section exists to reduce cognitive load.

A section must help users understand:

- what this group of fields is about
- why the fields belong together
- where one concern ends and another begins

A section must never feel decorative.

---

# 2. Primitive Goal

`FormSection` is the canonical grouping wrapper for related form fields.

It standardizes:

- section heading hierarchy
- optional section description
- field grouping
- section spacing
- column layout
- boundaries between groups
- optional section-level status presentation
- optional section actions when explicitly approved

`FormSection` does not own business logic.

`FormSection` does not replace `FormField`.

---

# 3. When to Use

Use `FormSection` when:

- multiple fields belong to the same business topic
- a form needs visual or semantic grouping
- a page contains more than one domain concern
- a section needs a title and optional explanation
- a form would become harder to scan without grouping

Examples:

- General Information
- Access Settings
- Billing Details
- Audit Configuration
- Notification Rules

Do not use `FormSection` for a single isolated field unless that field truly represents its own meaningful business block.

---

# 4. Canonical Structure

Mandatory order:

FormSection  
 ├── SectionHeader  
 │ ├── Title  
 │ ├── Description (optional)  
 │ └── SectionAction (optional, restricted)  
 └── SectionBody  
 └── FormField[] | FormRow[] | approved nested layout primitives

Section header always appears before section body.

Section body always contains the grouped fields or approved field layout wrappers.

---

# 5. Required Elements

## 5.1 Title

Every `FormSection` must have a visible title.

Title must:

- be concise
- clearly describe the business group
- be always visible
- use approved section heading typography
- remain left-aligned

Good examples:

- General Information
- Access Control
- Project Settings
- Contact Details

Bad examples:

- Stuff
- Other
- More Info
- Settings Area 2

## 5.2 Description

Description is optional.

Description must:

- appear below the title
- explain business context, not field-level usage
- be concise
- help users understand the purpose of the group
- use approved supporting text typography

Good example:

`These settings control who can access the workspace and what actions they can perform.`

Description must not:

- duplicate field HelpText
- contain validation errors
- contain temporary system status
- replace field-level guidance

---

# 6. Section Body

Section body contains the actual fields.

Allowed contents:

- `FormField[]`
- approved field rows
- approved field groups
- approved nested layout wrappers if defined by the design system

Section body must:

- preserve consistent spacing
- preserve consistent alignment
- maintain a clear reading order
- avoid arbitrary nesting depth

Section body must not introduce decorative wrappers that weaken scanability.

---

# 7. Layout Variants

`FormSection` supports only approved layout variants.

## 7.1 Stack

Default layout.

Fields are rendered in a single vertical flow.

Use when:

- fields vary in height
- fields require careful reading
- content density should remain low
- mobile-first readability is preferred

## 7.2 TwoColumn

Allowed only when fields are logically pairable and readability remains strong.

Use when:

- fields are short
- paired comparison is easy
- the section remains visually balanced
- scanning speed clearly improves

Examples:

- First Name / Last Name
- Start Date / End Date
- City / Postal Code

Two-column layout must not be used for:

- long textareas
- complex HelpText-heavy fields
- mixed control densities that create visual imbalance
- groups that become harder to read side by side

## 7.3 Dense enterprise variants

Dense layout is not a separate visual mode unless system-approved.

Do not invent compact section density ad hoc.

---

# 8. Field Grouping Rules

Fields grouped inside a section must share a real business relationship.

Group by:

- domain meaning
- user task
- decision context
- lifecycle step

Do not group by:

- arbitrary implementation order
- database order
- leftover space in the layout
- visual symmetry alone

Good grouping:

- identity fields together
- permission fields together
- scheduling fields together

Bad grouping:

- all short fields on the left because they fit
- unrelated fields paired just to fill a two-column grid

---

# 9. Section Boundaries

A section boundary must be visually clear but not heavy.

Approved section boundary treatments may include:

- vertical spacing
- subtle divider
- card/container boundary if defined by the page pattern

Choose the lightest treatment that preserves clarity.

A boundary must communicate structure, not decoration.

---

# 10. Section Actions

Section-level actions are optional and restricted.

Examples of valid section actions:

- Edit
- Add item
- Remove item
- Expand
- Collapse

Section actions must:

- appear in the header area
- be clearly secondary to the section title
- not compete visually with page-level primary actions
- be used only when there is a real section-specific operation

Section actions must not:

- replace page-level submit actions
- contain unrelated business logic
- overload the section header
- appear unless there is a genuine need

If no meaningful section action exists, none should be rendered.

---

# 11. Collapsible Behavior

Collapsible behavior is optional and must be intentional.

Use collapsible sections only when:

- the page is long enough to justify progressive disclosure
- the collapsed state does not hide critical blocking information
- the section title is strong enough to remain understandable when collapsed

Collapsible sections must:

- preserve keyboard accessibility
- expose expanded/collapsed state semantically
- keep the interaction predictable
- not be used as a substitute for good information architecture

Critical or high-frequency sections should remain expanded by default.

---

# 12. Readonly and Disabled at Section Level

Section-level state is allowed only when it improves clarity.

## 12.1 Readonly section

A readonly section means:

- fields remain visible
- content remains inspectable
- controls may render in readonly mode
- users can understand values without editing them

Use readonly when the user still needs to review the section.

## 12.2 Disabled section

A disabled section means:

- section interaction is unavailable
- controls are non-interactive
- state is visually muted

Use disabled sparingly.

Disabled at section level should be used only when the whole group is genuinely unavailable.

Readonly is preferred over disabled when content still matters contextually.

---

# 13. Validation Behavior

`FormSection` does not own validation logic.

However, it must support validation presentation at section level when needed.

Examples of allowed section-level validation presentation:

- section summary badge
- section error hint near title
- section warning marker

Section-level indicators must:

- remain secondary to field-level errors
- help users identify which section contains issues
- not replace inline field validation

Field-level errors remain the primary validation surface.

---

# 14. Section Status

Section-level status may be used where meaningful.

Allowed statuses may include:

- default
- warning
- error
- readonly
- complete

Section status must:

- remain subtle
- support scanability
- not overwhelm the section title
- never replace field-level detail

Example use cases:

- section contains blocking errors
- section is complete
- section is readonly due to workflow state

---

# 15. Accessibility

All sections must satisfy the following.

## 15.1 Heading semantics

Section title must use the correct heading level for the page hierarchy.

Do not skip heading levels arbitrarily.

## 15.2 Description association

If description provides important context for the grouped controls, it should be programmatically associated where appropriate through the containing structure.

## 15.3 Collapsible semantics

If collapsible:

- expanded state must be exposed semantically
- toggle control must be keyboard accessible
- collapsed content must be properly hidden from assistive technology when collapsed

## 15.4 Reading order

The section must preserve a logical DOM order:

- title
- description
- action if present and semantically appropriate
- body fields in reading order

Visual layout must not break logical reading order.

---

# 16. Layout and Spacing Rules

Section spacing must be consistent across the page.

Rules:

- section header and section body must use approved spacing tokens
- distance between sections must be greater than distance between fields within a section
- internal spacing must remain rhythmically consistent
- section titles must align consistently across sibling sections

Do not create ad hoc padding or margin rules per section.

---

# 17. Forbidden Patterns

Forbidden:

- section without visible title
- decorative section containers without business meaning
- arbitrary nesting of sections inside sections
- section used only to create visual spacing
- unrelated fields grouped together
- two-column layout for long or complex fields
- section action used as primary form action
- hidden section title
- collapsible sections that hide critical blocking content by default
- section description used as field-level validation
- inconsistent heading hierarchy
- dense layout invented locally without system approval

---

# 18. Definition of Done

A `FormSection` is compliant if:

- it has a visible title
- description, when present, appears below the title
- fields are meaningfully grouped
- layout uses an approved variant
- spacing is consistent with system tokens
- section boundaries are clear
- section actions, if present, are secondary and relevant
- accessibility semantics are implemented
- validation remains primarily field-level
- no forbidden pattern is used

---

# 19. Canonical Examples

## 19.1 Standard section

Title:
`General Information`

Description:
`Basic project information visible to workspace members.`

Body:

- Project Name
- Project Code
- Description

Layout:

- stack

## 19.2 Two-column section

Title:
`Contact Details`

Description:
`Primary contact information for notifications and follow-up.`

Body:

- First Name
- Last Name
- Email
- Phone Number

Layout:

- two-column

## 19.3 Readonly section

Title:
`Audit Metadata`

Description:
`System-managed values recorded for compliance and traceability.`

Body:

- Created At
- Created By
- Updated At
- Updated By

Layout:

- stack
  State:
- readonly

## 19.4 Collapsible section

Title:
`Advanced Notification Rules`

Description:
`Optional rules for exception routing and alert escalation.`

Body:

- Escalation Delay
- Severity Threshold
- Fallback Recipients

Layout:

- stack
  Behavior:
- collapsible

---

# 20. Final Rule

If a section looks visually neat but weakens form clarity, it is non-compliant.

Structure, readability, and semantic grouping take priority over stylistic variation.
