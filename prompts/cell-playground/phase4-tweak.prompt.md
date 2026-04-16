---
name: cell-playground/phase4-tweak
description: Phase 4 tweak instruction. Keeps tweak mode patch-first and prevents broad regeneration.
usage: Selected by phaseInstructionPrompt() in phase-prompts.ts when phase is phase4_tweak.
version: 1.0.0
arguments: []
---
PHASE 4 TWEAK:
- Prefer mode=patch using patch_operations.
- Patch path root object is:
{ "manifest": ..., "entity_schema": [...], "layout": [...], "action": [...], "permission": [...] }
- Use mode=replacement only if patch is not feasible.
