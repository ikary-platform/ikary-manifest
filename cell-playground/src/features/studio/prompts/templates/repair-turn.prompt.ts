/**
 * Goal: Build corrective retry requests with explicit validation feedback and prior invalid output.
 */
export const REPAIR_TURN_PROMPT_TEMPLATE = `Current phase: {{phase}}

Canonical schema contract:
{{canonical_schema_primer}}

Phase response JSON schema (must match exactly):
{{phase_schema}}

The previous JSON output failed validation.
Validation error: {{validation_error}}

Previous invalid output:
{{previous_invalid_output}}

Latest user message:
{{user_message}}

Conversation history:
{{conversation_history}}

Current artifacts (hidden context):
{{current_artifacts}}

Generate a corrected JSON output matching schema exactly.`;
