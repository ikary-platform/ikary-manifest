---
applyTo: "README.md,CONTRIBUTING.md,apps/docs/**/*.md,apps/cli/README.md,apps/ikary/README.md,libs/**/README.md,manifests/**/*.md,releases/*.md"
excludeAgent: "cloud-agent"
---

Review this PR as documentation.

Prioritize:
- docs match shipped behavior: commands, options, ports, file paths, package names, endpoints, request or response shapes, and current examples
- onboarding still reflects the real repo flow: `pnpm`, Node 24, turbo workspace, CLI, and local stack
- behavior changes in contracts, runtime, CLI, or docs checks are reflected in the relevant guide or reference page

Good looks like:
- examples match real APIs and current schema keys
- unsupported or planned behavior is clearly labeled instead of implied to work today
- links and route references point to real pages and files

Flag regressions:
- docs promise behavior the implementation does not provide
- stale CLI output, old package names, wrong ports, or missing pages after renames
- examples that omit required fields or use outdated contract keys
- changed commands or endpoints without matching updates to docs smoke or freshness checks

Ignore:
- prose-only edits unless they change technical meaning
- marketing wording unless it misleads readers about actual capabilities
