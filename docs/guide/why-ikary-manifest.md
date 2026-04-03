# Why IKARY Manifest

**AI should generate manifests, not code.**

## The problem with generated code

AI-native code generation tools produce code. This creates a fundamental problem: **generated code is unpredictable, hard to maintain, and expensive to validate in production.** Every generated line is a liability -- it must be reviewed, tested, versioned, and debugged like hand-written code, except nobody wrote it.

## The manifest approach

IKARY Manifest takes a different approach. Instead of generating code, **LLMs generate a canonical YAML manifest** that a deterministic runtime compiles into a fully functional application. The manifest is the product. The code is an implementation detail.

## Why this matters

### 1. Deterministic output

The same manifest always produces the same application. No hallucinated logic, no subtle runtime bugs, no "works on my machine." The runtime is tested once; every manifest benefits.

### 2. Drastically lower maintenance

Updating a business rule means changing a YAML field, not hunting through generated controllers, services, and components. No dead code, no orphaned files, no framework-specific boilerplate to maintain.

### 3. Code quality is not a concern

LLMs don't produce code, so there is no code to review for quality. The manifest is a structured declaration: either it validates or it doesn't. There is no "bad style" in YAML.

### 4. Any model can do it

Generating a correct YAML document is orders of magnitude simpler than generating correct, idiomatic, production-grade code across multiple frameworks. Smaller, cheaper models produce valid manifests reliably. Token cost for application generation drops dramatically.

### 5. Runtime evolves independently

The manifest is canonical. The underlying engine can change stack, upgrade frameworks, optimize rendering, or switch languages -- without touching the generation layer. Clear separation of concerns between AI generation and runtime execution.

### 6. Reviewable by non-engineers

A YAML manifest is readable by product owners, domain experts, and compliance teams. They can review, diff, and approve application changes without reading code.

### 7. Validated before runtime

Manifests are structurally and semantically validated before any code runs. Invalid manifests are caught at authoring time, not in production. Generated code fails at runtime.

### 8. Multi-runtime portability

One manifest, multiple runtimes. React today, mobile tomorrow, FastAPI backend next week. Code generation locks you to one framework; a manifest is framework-neutral by design.
