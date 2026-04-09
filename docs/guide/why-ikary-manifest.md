# Why IKARY Manifest

**AI should generate manifests, not code.**

## The problem with generated code

AI-native code generation tools produce code. This creates a practical problem: generated code is unpredictable, hard to maintain, and expensive to validate in production. Every generated line must be reviewed, tested, versioned, and debugged like hand-written code, without the benefit of human intent behind it.

## The manifest approach

IKARY Manifest takes a different approach. Instead of generating code, LLMs generate a canonical YAML manifest that a deterministic runtime compiles into a fully functional application. The manifest describes what to build; the runtime handles how to build it.

## The vision

Web applications are the first proving ground. They are complex, well-understood, and touch every layer of a software system: data models, API contracts, access control, and UI rendering. If a complete web application can be described declaratively, the same model extends to other interaction surfaces.

The roadmap includes reporting, dashboarding, voice interactions, and machine-to-machine integrations. Each surface is a different rendering target for the same declarative description. The manifest format grows alongside them.

The manifest system stays open. When the declarative layer is not expressive enough for a specific requirement, the author can embed raw code in that section. This escape hatch keeps the project usable in production. IKARY Manifest is not an academic exercise.

## Current scope

The first implementation targets Node.js with TypeScript. The manifest format is language-neutral: nothing prevents a Rust, Ruby, Go, or Python runtime from consuming the same YAML.

On the API side, NestJS is the current generator. This is an implementation choice, not a permanent requirement. A different generator could produce Express routes, Django views, or FastAPI endpoints from the same manifest.

On the UI side, React is the first renderer target. Vue.js is next. Tailwind CSS provides sensible visual defaults. The renderer does not depend on Tailwind or any specific UI framework; dependencies are kept low by design. The project is and will remain open-source.

## Why this matters

### Deterministic output

The same manifest always produces the same application. The runtime is tested once; every manifest benefits from that work.

### Lower maintenance overhead

Updating a business rule means changing a YAML field, not hunting through generated controllers, services, and components. No dead code, no orphaned files, no framework boilerplate to maintain.

### No code to review for quality

LLMs generate a structured declaration, not source code. A manifest either validates or it does not. There is no style to debate in YAML.

### Works with any model

Generating a correct YAML document is significantly simpler than generating correct, idiomatic, production-grade code across multiple frameworks. Smaller, cheaper models produce valid manifests reliably.

### Runtime evolves independently

The manifest is canonical. The underlying engine can change stack, upgrade frameworks, optimize rendering, or switch languages without touching the generation layer. There is a clear separation of concerns between AI generation and runtime execution.

### Reviewable by non-engineers

A YAML manifest is readable by product owners, domain experts, and compliance teams. They can review, diff, and approve application changes without reading code.

### Validated before runtime

Manifests are structurally and semantically validated before any code runs. Invalid manifests are caught at authoring time, not in production.

### Multi-runtime portability

One manifest, multiple runtimes. React today, mobile tomorrow, new backend next week. Code generation ties you to one framework; a manifest is framework-neutral by design.
