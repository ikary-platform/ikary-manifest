---
status: accepted
date: 2026-04-10
---

# 001 - Autonomous Development Loop

## Context

IKARY is maintained by a small team. Translating GitHub issues into working code
involves repeated manual steps: reading conventions, planning, implementing,
reviewing, and fixing review feedback. Each step requires context that already
exists in the repo (CLAUDE.md, LIBRARY_STYLE_RULES.md, doc-voice.md).

Claude Code Action can automate most of this loop while respecting repo
conventions, with a human approval gate before merge.

## Decision

We adopt a 4-phase autonomous development loop driven by GitHub issue comments.
All phases use the Anthropic API via `anthropics/claude-code-action@v1`.

### Phase 1 -- Plan

| Trigger | Workflow | Result |
|---|---|---|
| `@claude plan feature` | `claude-plan-feature.yml` | Structured feature plan posted as issue comment |
| `@claude plan fix` | `claude-plan-fix.yml` | Structured fix plan posted as issue comment |
| `@claude revise` | `claude-revise.yml` | Existing plan updated based on feedback in the comment |

Plan workflows use sticky comments. Revisions edit the same comment instead of
posting new ones. The revise workflow detects the plan type automatically.

The loop between plan and revise continues until the human approves.

### Phase 2 -- Implement

| Trigger | Workflow | Result |
|---|---|---|
| `@claude do feature` | `claude-feature.yml` | Branch created, feature implemented, PR opened |
| `@claude do fix` | `claude-fix.yml` | Branch created, fix implemented, PR opened |

Implementation workflows read the approved plan from the issue comments and
follow it step by step. They run `pnpm build` and `pnpm typecheck` before
opening the PR.

### Phase 3 -- Review loop

| Step | Owner | Action |
|---|---|---|
| CI | GitHub Actions | Tests, lint, build, typecheck |
| Code review | External (Codex/Copilot) | Posts inline PR comments |
| Fix loop | `claude-pr-fix.yml` | Claude reads review comments, fixes code, pushes |

This cycle repeats until CI is green and no unresolved review comments remain.

### Phase 4 -- Merge

A human reviews the final PR and approves. The PR merges to main and closes the
originating issue.

### Architecture diagram

See `decisions/diagrams/ikary-autonomous-dev-loop.svg`.

## IKARY convention enforcement

All workflows inject a shared `custom_instructions` block that directs Claude to
read and follow:

- `CLAUDE.md` -- Zod contracts, library rules
- `libs/LIBRARY_STYLE_RULES.md` -- microPackageKind, folder layout, Kysely
- `libs/LIBRARY_TEMPLATE.md` -- folder blueprint, exports
- `.claude/doc-voice.md` -- documentation style
- `CONTRIBUTING.md` -- package structure, testing

## Security

- Only users listed in the `CLAUDE_ALLOWED_USERS` repository variable can
  trigger workflows.
- Concurrency groups keyed on issue/PR number prevent parallel Claude runs on
  the same thread.
- Human approval is required before merge. No auto-merge.

## Consequences

- API key costs scale with issue volume and implementation complexity.
- Claude may produce code that needs manual adjustment for edge cases.
- The human approval gate in Phase 4 remains the safety net.
- Plan quality improves over iterations via `@claude revise`.
