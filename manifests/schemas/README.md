# JSON Schemas

This directory contains language-neutral JSON Schema files generated from the TypeScript/Zod contract definitions.

These schemas enable validation in any language (Python, Go, etc.) without depending on the TypeScript runtime.

To regenerate after contract changes:

```bash
pnpm run generate:schema
```

Note: JSON Schema covers structural validation only. Semantic rules (unique keys, cross-entity references, lifecycle consistency) are enforced at runtime by each language's validator.
