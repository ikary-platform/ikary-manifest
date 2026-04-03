# Form Field Contract

Version: 2.2  
Scope: ikary-ui  
Status: Mandatory

This document defines the canonical `FormField` primitive for Ikary.

Input behavior at the control level (typed wrappers, affixes, native input semantics, focus behavior, state tokens, and low-level accessibility defaults) is governed by:

`system/ui/14-INPUT.MD`

All form inputs must use the shared `FormField` primitive and its approved variants.  
Custom field layout is forbidden.

---

# 1. Form Philosophy

Forms must be:

- Clear
- Predictable
- Structured
- Enterprise-oriented
- Free of decorative patterns

Forms must optimize for:

- readability
- fast scanning
- low ambiguity
- low cognitive load
- reliable validation feedback

Forbidden:

- floating labels
- placeholder-only labels
- decorative motion
- animated gimmicks
- hidden required logic
- style-first field behavior

---

# 2. Primitive Goal

`FormField` is the canonical structural wrapper for a form control.

It standardizes:

- field anatomy
- label and legend behavior
- help and hint placement
- inline field messaging
- required indication
- described-by wiring
- validation state presentation
- layout consistency

`FormField` does not own business logic.

---

# 3. Approved Variants

There are 3 approved field variants.

## 3.1 StandardField

Used for:

- text
- number
- email
- password
- textarea
- select
- date
- enterprise toggle

Mandatory order:

FormField  
 ├── Label  
 ├── HelpText (optional)  
 ├── InputControl  
 ├── SmallTip (optional)  
 └── FieldMessage (conditional)

## 3.2 CheckboxField

Used for:

- checkbox

Mandatory order:

FormField  
 ├── CheckboxRow  
 │ ├── CheckboxControl
│ └── Label
├── HelpText (optional)
├── SmallTip (optional)
└── FieldMessage (conditional)

This is the only approved exception where the label appears to the right of the control.

## 3.3 ChoiceGroupField

Used for:

- radio group

Mandatory order:

FormField  
 ├── Legend
├── HelpText (optional)
├── OptionGroup
├── SmallTip (optional)
└── FieldMessage (conditional)

Radio inputs must be treated as a group, not as isolated single fields.

---

# 4. Ownership Boundaries

## 4.1 FormField owns

- structure
- label or legend rendering
- help text rendering
- small tip rendering
- field message rendering
- required marker rendering
- invalid, warning, success presentation
- `aria-describedby` composition
- stable spacing and layout tokens

## 4.2 Input primitive owns

- control interaction
- native semantics
- keyboard behavior
- low-level focus behavior
- affixes
- inline control affordances
- loading affordances inside the control when applicable

## 4.3 Form container owns

- field registration
- schema validation orchestration
- submit orchestration
- form-level errors
- async validation coordination
- analytics enrichment
- business rules
- data commit logic

Business logic must not live inside the field primitive.

---

# 5. Label Rules

## 5.1 Standard labels

For `StandardField`, label must:

- always be visible
- appear above HelpText and InputControl
- be left-aligned
- use strong body or title token
- support required indication

Example:

`Project Name *`

## 5.2 Checkbox labels

For `CheckboxField`, label must:

- appear to the right of the checkbox control
- remain clearly associated with the checkbox
- support required indication when applicable
- be clickable with the control

This is the only permitted right-side label pattern.

## 5.3 Group labels

For `ChoiceGroupField`, use `Legend`, not `Label`.

Legend must:

- always be visible
- appear above HelpText and OptionGroup
- clearly name the group
- support required indication

---

# 6. Required Indicator

Required fields must:

- display `*`
- not rely on color only
- be explicit in the UI
- be represented semantically in the control layer

The required indicator is a visibility rule, not the validation mechanism.

Examples:

- `Project Name *`
- `Access Level *`

Required must not rely solely on the native HTML `required` attribute.

---

# 7. HelpText

HelpText is the business explanation area.

HelpText:

- appears directly below Label or Legend
- explains business meaning, context, or consequence
- uses small body typography token
- is static informational content

Example:

`This name will be visible to all workspace members.`

HelpText must not:

- contain validation errors
- contain transient status
- duplicate SmallTip
- replace the required indicator

Use HelpText for meaning, not for validation or temporary guidance.

---

# 8. InputControl Rules

Approved controls:

- text
- number
- email
- password
- textarea
- select
- checkbox
- radio group
- date
- enterprise toggle

Custom stylized inputs are forbidden unless system-approved.

Controls must:

- use approved design tokens
- expose consistent focus states
- preserve layout stability across states
- support disabled, readonly, invalid, and loading states when applicable

---

# 9. Enterprise Toggle Rules

Enterprise toggle is a `StandardField`, not a `CheckboxField`.

Mandatory structure:

FormField  
 ├── Label  
 ├── HelpText (optional)  
 ├── ToggleControl  
 ├── SmallTip (optional)  
 └── FieldMessage (conditional)

Rationale:

- checkbox remains the only right-label exception
- toggle should retain strong vertical scanning consistency
- toggle often represents a setting with meaningful business context

Toggle labels must not move inline to the right of the control.

---

# 10. SmallTip

SmallTip is the usage hint area.

SmallTip:

- appears directly below InputControl or OptionGroup
- is optional
- provides short practical guidance
- uses subtle typography token

Examples:

- `Keep it short.`
- `Maximum 50 characters.`
- `Use lowercase only.`

SmallTip must:

- be concise
- remain non-critical
- not duplicate HelpText
- not replace validation
- not carry business-critical explanation

Use SmallTip for usage guidance, not policy or business meaning.

---

# 11. FieldMessage

Each field has a single message slot: `FieldMessage`.

`FieldMessage` may render one of:

- error
- warning
- success

Only one message may be visible at a time.

Priority is mandatory:

`error > warning > success`

## 11.1 Error message rules

Error messages must:

- appear below SmallTip when SmallTip exists
- use error typography token
- be explicit
- be actionable when possible
- avoid vague wording

Bad:

`Invalid value`

Good:

`Project name must be at least 3 characters.`

## 11.2 Warning message rules

Warnings must:

- be concise
- explain risk or consequence
- not block interaction unless explicitly defined elsewhere
- not rely on color only

Example:

`Changing this value may affect existing reports.`

## 11.3 Success message rules

Success messages must:

- be short
- confirm a meaningful field-level status
- not duplicate larger form success messaging
- not rely on color only

Example:

`Slug is available.`

## 11.4 Layout stability

Field messages must not cause excessive layout shift.

Implementations should reserve enough space or use stable spacing so validation feedback does not create disruptive motion.

---

# 12. Validation Layers

Validation exists at 3 layers:

1. Client schema validation
2. Draft validation
3. Commit validation

## 12.1 Client schema validation

Client validation must:

- run locally
- provide immediate field feedback when appropriate
- use shared schema definitions where possible

Zod is the standard client validation layer.

## 12.2 Draft validation

Draft validation checks whether current in-progress form state is structurally acceptable for continued editing or saving draft state.

Draft validation must not:

- destroy current input
- reset the form
- block normal reading of entered values

## 12.3 Commit validation

Commit validation is the final blocking validation before submission or persistence.

Commit validation must:

- run server-side
- prevent submission when blocking errors exist
- map returned field errors back to inline fields when possible
- render non-field errors at form level

---

# 13. Validation Timing

Validation timing must be predictable.

## 13.1 Before interaction

Before a field has been interacted with:

- no inline error should be shown by default

## 13.2 On blur

On first blur:

- show the first relevant blocking validation error if one exists

## 13.3 On change after dirty

After the field is dirty:

- validation may update inline as the user edits
- feedback should reduce friction, not create noise

## 13.4 On submit

On submit attempt:

- all blocking field errors must become visible
- form-level blocking errors must render above the submit action area

Validation must not:

- open modals
- clear input state
- reset unrelated fields

---

# 14. Async Validation

Async validation is allowed for cases such as:

- slug uniqueness
- external reference checks
- server-backed policy checks

Async validation must:

- be debounced
- cancel or ignore stale requests
- never overwrite newer user input with older validation results
- preserve layout stability
- remain understandable to the user

For text-like controls, loading may appear inside the input border.

For non-text controls, loading may appear adjacent to the control or in the field message area.

Async validation must not block editing by default.

Only the field or action explicitly under validation may be temporarily restricted when necessary.

---

# 15. Required Behavior

Required fields must:

- display `*`
- validate client-side
- validate server-side
- expose required state semantically
- prevent form submission when blocking validation errors exist

Required logic must be visible and predictable.

Forbidden:

- hidden required conditions without explanation
- required status communicated by color only
- reliance on browser-native validation alone

---

# 16. Disabled vs Readonly

## 16.1 Disabled

Disabled means:

- not editable
- not focusable
- visually muted
- excluded from normal interaction

Use disabled only when the user cannot interact with the field in the current state.

## 16.2 Readonly

Readonly means:

- visible
- focusable when appropriate for the control type
- selectable when relevant
- not user-editable

Readonly is preferred when showing committed or controlled data that users may need to inspect or copy.

Use readonly instead of disabled when the information still matters contextually.

---

# 17. Layout Rules

Fields must stack vertically by default.

Allowed:

- single-column layout
- two-column layout for logically grouped fields
- grouped sections with clear headings

Rules:

- use consistent spacing tokens
- preserve alignment rhythm
- keep label positions consistent within a form region
- avoid arbitrary mixing of field densities and spacing rules

Do not mix unrelated layout strategies inside the same form without structural reason.

---

# 18. Form-Level Errors

Form-level errors must render above the primary submit area.

Use form-level errors for:

- cross-field validation failures
- server failures not tied to one field
- submission-level business constraints

Form-level errors must not replace field-level errors when a specific field is known.

---

# 19. Loading and Submit Behavior

## 19.1 Field-level loading

When a field performs async validation or async lookup:

- keep layout stable
- preserve current value visibility
- show a localized loading affordance
- avoid blocking unrelated fields

## 19.2 Form submit loading

When the form is submitting:

- submit button must show loading
- duplicate submissions must be prevented
- entered values must remain visible
- layout must remain stable

Form submission must not require disabling all inputs as a blanket rule.

The form container may restrict only the interactions necessary to prevent conflicting state changes.

---

# 20. Accessibility

All fields must satisfy the following.

## 20.1 Label association

- `Label` must be associated to its control via `for` / `id`, or equivalent accessible association
- checkbox label must activate the checkbox
- radio groups must use `fieldset` and `legend`

## 20.2 Description association

`aria-describedby` must include the ids of visible supporting content in render order:

1. HelpText
2. SmallTip
3. FieldMessage

## 20.3 Error state semantics

Invalid controls must expose invalid state semantically.

Examples include:

- `aria-invalid="true"` when invalid
- accessible error message association
- stable message id references

## 20.4 Required semantics

Required controls must expose required state semantically where relevant.

## 20.5 Keyboard support

All controls must:

- support full keyboard navigation
- preserve visible focus state
- avoid focus traps
- remain operable without pointer input

## 20.6 Messaging accessibility

Field messages must not rely on color only.

Error announcement behavior must be consistent across the system.

---

# 21. State Model

Every approved field variant must support the canonical state model where applicable:

- default
- focused
- dirty
- readonly
- disabled
- loading
- invalid
- warning
- success

State presentation must be:

- visually consistent
- semantically exposed
- stable across all approved controls

---

# 22. Observability

The field system must support observability for validation and submission outcomes.

## 22.1 Field-level events

On field error, emit:

- `form_field_error`

Recommended payload:

- `field_name`
- `field_type`
- `entityType`
- `route`
- `workspaceId`
- `cellId`

## 22.2 Form-level events

On submit lifecycle, emit:

- `form_submit_attempt`
- `form_submit_success`
- `form_submit_error`

Event enrichment with route, workspace, entity, and cell context should be handled by the form or application layer, not by low-level input controls.

---

# 23. Forbidden Patterns

Forbidden:

- floating labels
- placeholder as label
- label to the right of input except checkbox
- hidden required logic
- color-only validation indicators
- decorative animated inputs
- business logic inside field primitive
- multiple competing message areas for one field
- radio inputs rendered without group semantics
- form validation inside modal dialogs
- form reset as a side effect of validation failure

---

# 24. Definition of Done

A field is compliant if:

- it uses the approved `FormField` variant
- its label or legend is always visible
- HelpText appears in the correct position
- SmallTip appears in the correct position
- `FieldMessage` is the final field slot
- required state is clearly marked
- validation is integrated correctly
- accessibility semantics are implemented
- layout is consistent with system spacing
- message priority follows `error > warning > success`
- no forbidden pattern is used

---

# 25. Canonical Examples

## 25.1 StandardField

- Label: `Project Name *`
- HelpText: `This name will be visible to all workspace members.`
- InputControl: text input
- SmallTip: `Maximum 50 characters.`
- FieldMessage: `Project name must be at least 3 characters.`

## 25.2 CheckboxField

- CheckboxControl: consent checkbox
- Label: `I agree to the retention policy *`
- HelpText: `You must accept this policy before continuing.`
- SmallTip: none
- FieldMessage: `You must accept the retention policy.`

## 25.3 ChoiceGroupField

- Legend: `Access Level *`
- HelpText: `This controls what the user can do in the workspace.`
- OptionGroup: radio list
- SmallTip: `Choose the lowest level that satisfies the need.`
- FieldMessage: `Please select an access level.`

## 25.4 EnterpriseToggle

- Label: `Enable audit logging`
- HelpText: `All critical actions will be recorded for compliance review.`
- ToggleControl: boolean toggle
- SmallTip: `Recommended for production workspaces.`
- FieldMessage: warning or success when relevant

---

# 26. Final Rule

If a field implementation is visually appealing but violates this contract, it is non-compliant.

Consistency, accessibility, and clarity take priority over stylistic variation.
