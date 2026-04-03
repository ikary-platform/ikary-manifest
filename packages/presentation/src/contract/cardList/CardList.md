# CardList Contract

Version: 1.0  
Scope: cell-contract-presentation  
Status: Mandatory

This document defines the canonical `CardList` primitive for IKARY Cell presentation.

`CardList` is a collection presentation primitive used to render a set of records as compact, structured cards inside list-oriented pages.

It is a presentation primitive.

It does not own:

- data fetching
- pagination truth
- sort truth
- filter orchestration
- search orchestration
- bulk action orchestration
- page identity
- page header
- routing orchestration
- mutation logic

Those concerns belong to the runtime, page controller, or surrounding page composition.

---

# 1. Purpose

`CardList` exists to render a collection of records in a structured card-based layout.

Examples:

- customer summaries
- project overview cards
- environment cards
- task cards
- user directory cards
- lightweight catalog records

`CardList` is not:

- a free-form dashboard
- a kanban board
- a data grid
- a page shell
- a search/filter bar

It is a reusable list renderer.

---

# 2. Primitive Responsibilities

`CardList` owns:

- card layout
- card header/body/footer structure
- optional card media/icon area
- card-level actions
- compact metadata/value display
- empty state surface
- loading skeleton surface if runtime exposes it
- responsive card grid/list layout

`CardList` does not own:

- page header
- pagination state ownership
- filter state ownership
- selection orchestration
- collection fetching
- domain decision logic
- mutation orchestration

---

# 3. Primitive Philosophy

`CardList` must be:

- structured
- scannable
- compact
- predictable
- enterprise-oriented

It must avoid:

- decorative consumer-style card excess
- highly custom per-card layouts in the contract
- uncontrolled rich content
- deeply nested card hierarchies
- visually noisy action clusters
- excessive metrics packed without hierarchy

Each card should communicate identity and key information quickly.

---

# 4. Canonical Use Cases

`CardList` should be used for:

- summary cards for entities
- visual alternatives to data-grid
- overview cards with key metadata
- compact directory views
- simple operational cards
- list pages where hierarchy matters more than density

It should not be used for:

- large dense collections better suited to data-grid
- highly irregular dashboard widgets
- timelines
- kanban boards
- forms
- arbitrary content blocks

---

# 5. Canonical Structure

A `CardList` must follow this structure:

```txt
CardList
  ├── Card
  │    ├── Header
  │    │    ├── Title
  │    │    ├── Subtitle (optional)
  │    │    └── Badge / Meta (optional)
  │    ├── Body
  │    │    ├── Fields / Metrics / Summary content
  │    └── Footer (optional)
  │         └── Actions / Secondary metadata
  └── EmptyState (conditional)

```
