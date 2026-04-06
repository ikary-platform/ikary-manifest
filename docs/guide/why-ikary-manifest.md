# Why IKARY Manifest

**AI should generate manifests, not code.**

## The problem with generated code

AI-native code generation tools produce code. This creates a practical problem: **generated code is unpredictable, hard to maintain, and expensive to validate in production.** Every generated line must be reviewed, tested, versioned, and debugged like hand-written code, without the benefit of human intent behind it.

## The manifest approach

IKARY Manifest takes a different approach. Instead of generating code, **LLMs generate a canonical YAML manifest** that a deterministic runtime compiles into a fully functional application. The manifest describes what to build; the runtime handles how to build it.

## Why this matters

### 1. Deterministic output

The same manifest always produces the same application. The runtime is tested once; every manifest benefits from that work.

### 2. Lower maintenance overhead

Updating a business rule means changing a YAML field, not hunting through generated controllers, services, and components. No dead code, no orphaned files, no framework boilerplate to maintain.

### 3. No code to review for quality

LLMs generate a structured declaration, not source code. A manifest either validates or it does not. There is no style to debate in YAML.

### 4. Works with any model

Generating a correct YAML document is significantly simpler than generating correct, idiomatic, production-grade code across multiple frameworks. Smaller, cheaper models produce valid manifests reliably.

### 5. Runtime evolves independently

The manifest is canonical. The underlying engine can change stack, upgrade frameworks, optimize rendering, or switch languages without touching the generation layer. There is a clear separation of concerns between AI generation and runtime execution.

### 6. Reviewable by non-engineers

A YAML manifest is readable by product owners, domain experts, and compliance teams. They can review, diff, and approve application changes without reading code.

### 7. Validated before runtime

Manifests are structurally and semantically validated before any code runs. Invalid manifests are caught at authoring time, not in production.

### 8. Multi-runtime portability

One manifest, multiple runtimes. React today, mobile tomorrow, FastAPI backend next week. Code generation ties you to one framework; a manifest is framework-neutral by design.
