---
name: cell-playground/user-turn
description: First-attempt user turn template. Bundles canonical schema, phase schema, latest message, history, and current artifacts.
usage: Used by buildUserPrompt in phase-prompts.ts for the initial generation request of a turn.
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

Latest user message:
{{{user_message}}}

Conversation history:
{{{conversation_history}}}

Current artifacts (hidden context):
{{{current_artifacts}}}

Return JSON only that matches the provided schema.
