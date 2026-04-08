/**
 * Goal: Force a human-readable generation plan before any initial build.
 */
export const PHASE2_PLAN_SYSTEM_PROMPT = `PHASE 2 PLAN:
- Produce an English explanation in assistant_visible_text.
- Explain what entities, pages, actions, permissions will be generated.
- Set generation_ready true only if plan is coherent and specific.
- If generation_ready is false, assistant_visible_text must explicitly say what is missing and must not claim readiness.`;
