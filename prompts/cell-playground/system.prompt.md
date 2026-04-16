---
name: cell-playground/system
description: System prompt envelope. Composes the base rules with the active phase instruction.
usage: Used by buildSystemPrompt in phase-prompts.ts to produce the system message sent to the model.
version: 1.0.0
arguments:
  - name: base_rules
    description: Rendered base-system-rules prompt.
    type: string
    source: system
    required: true
  - name: phase_instruction
    description: Phase-specific instruction prompt.
    type: string
    source: system
    required: true
---
{{{base_rules}}}

{{{phase_instruction}}}
