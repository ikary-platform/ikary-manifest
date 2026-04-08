# Studio Prompt Templates

All Studio prompt instructions are centralized in this folder.

- `templates/base-system-rules.prompt.ts`: global guardrails applied in every phase.
- `templates/phase1-define-system.prompt.ts`: Phase 1 discovery behavior.
- `templates/phase2-plan-system.prompt.ts`: Phase 2 planning behavior.
- `templates/phase3-generate-system.prompt.ts`: Phase 3 initial generation behavior.
- `templates/phase4-tweak-system.prompt.ts`: Phase 4 patch-first tweak behavior.
- `templates/canonical-schema-primer.prompt.ts`: compact canonical Cell contract primer.
- `templates/system.prompt.ts`: system prompt envelope template.
- `templates/user-turn.prompt.ts`: first-attempt user turn template.
- `templates/repair-turn.prompt.ts`: retry/correction template.

Rendering is handled by `template-engine.ts`.
`phase-prompts.ts` injects a Zod-derived JSON schema (`responseZodJsonSchemaForPhase`) into the base system rules for phase-specific output guidance.
