---
name: cell-playground/repair-turn
description: Corrective retry template. Adds the validation error and the previous invalid output to the user turn.
usage: Used by buildRepairPrompt in phase-prompts.ts after a validation failure.
version: 1.0.0
arguments:
  - name: phase
    description: The active Studio phase identifier.
    type: string
    source: system
    required: true
  - name: canonical_schema_primer
    description: Compact canonical Cell contract primer body.
    type: string
    source: system
    required: true
  - name: phase_schema
    description: JSON schema string for the phase response.
    type: string
    source: system
    required: true
  - name: validation_error
    description: Validation error message from the previous attempt.
    type: string
    source: system
    required: true
  - name: previous_invalid_output
    description: Stringified payload of the previous invalid attempt.
    type: string
    source: system
    required: true
  - name: user_message
    description: Latest user message text.
    type: string
    source: user
    required: true
    maxBytes: 16000
  - name: conversation_history
    description: Compacted conversation history.
    type: string
    source: system
    required: true
  - name: current_artifacts
    description: JSON-encoded snapshot of current Studio artifacts.
    type: string
    source: system
    required: true
---
Current phase: {{{phase}}}

Canonical schema contract:
{{{canonical_schema_primer}}}

Phase response JSON schema (must match exactly):
{{{phase_schema}}}

The previous JSON output failed validation.
Validation error: {{{validation_error}}}

Previous invalid output:
{{{previous_invalid_output}}}

Latest user message:
{{{user_message}}}

Conversation history:
{{{conversation_history}}}

Current artifacts (hidden context):
{{{current_artifacts}}}

Generate a corrected JSON output matching schema exactly.
