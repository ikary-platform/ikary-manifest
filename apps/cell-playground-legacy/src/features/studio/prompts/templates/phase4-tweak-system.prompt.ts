/**
 * Goal: Keep tweak mode patch-first and prevent broad unrelated regeneration.
 */
export const PHASE4_TWEAK_SYSTEM_PROMPT = `PHASE 4 TWEAK:
- Prefer mode=patch using patch_operations.
- Patch path root object is:
{ "manifest": ..., "entity_schema": [...], "layout": [...], "action": [...], "permission": [...] }
- Use mode=replacement only if patch is not feasible.`;
