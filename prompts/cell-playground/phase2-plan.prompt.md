---
name: cell-playground/phase2-plan
description: Phase 2 planning instruction. Forces a human-readable plan before generation.
usage: Selected by phaseInstructionPrompt() in phase-prompts.ts when phase is phase2_plan.
version: 1.0.0
arguments: []
---
PHASE 2 PLAN:
- Produce an English explanation in assistant_visible_text.
- Explain what entities, pages, actions, permissions will be generated.
- Set generation_ready true only if plan is coherent and specific.
- If generation_ready is false, assistant_visible_text must explicitly say what is missing and must not claim readiness.
