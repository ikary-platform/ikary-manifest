# Contributing to Ikary Manifest

Thank you for your interest in contributing to Ikary Manifest!

## Getting Started

1. Fork the repository
2. Clone your fork
3. Install dependencies: `pnpm install`
4. Build all packages: `pnpm build`
5. Run tests: `pnpm test`

## Development Workflow

1. Create a branch for your changes
2. Make your changes
3. Ensure `pnpm build` and `pnpm test` pass
4. Submit a pull request

## Package Structure

Each package follows the same pattern:

- `src/index.ts` — Public API exports
- `tsup.config.ts` — Build configuration (ESM + CJS + DTS)
- `vitest.config.ts` — Test configuration
- `tsconfig.json` — TypeScript configuration

## Guidelines

- All schemas use [Zod](https://zod.dev) for runtime validation
- TypeScript types are inferred from Zod schemas — don't duplicate types manually
- UI packages use React 19+ with hooks
- Keep packages focused — contracts should not import runtime code
- Write tests for all new schemas and validation logic

## Code of Conduct

Be respectful and constructive. We are building this together.
