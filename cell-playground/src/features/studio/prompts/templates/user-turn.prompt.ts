/**
 * Goal: Build the primary generation request with full Studio context and schema constraints.
 */
export const USER_TURN_PROMPT_TEMPLATE = `Current phase: {{phase}}

Canonical schema contract:
{{canonical_schema_primer}}

Phase response JSON schema (must match exactly):
{{phase_schema}}

Latest user message:
{{user_message}}

Conversation history:
{{conversation_history}}

Current artifacts (hidden context):
{{current_artifacts}}

Return JSON only that matches the provided schema.`;
