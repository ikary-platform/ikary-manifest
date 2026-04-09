import type { StudioCurrentArtifactSet, StudioMessageRecord, StudioPhase } from './contracts';
import { responseJsonSchemaForPhase, responseZodJsonSchemaForPhase } from './phase-schemas';
import { renderPromptTemplate } from './prompts/template-engine';
import {
  BASE_SYSTEM_RULES_PROMPT,
  CANONICAL_SCHEMA_PRIMER_PROMPT,
  PHASE1_DEFINE_SYSTEM_PROMPT,
  PHASE2_PLAN_SYSTEM_PROMPT,
  PHASE3_GENERATE_SYSTEM_PROMPT,
  PHASE4_TWEAK_SYSTEM_PROMPT,
  REPAIR_TURN_PROMPT_TEMPLATE,
  SYSTEM_PROMPT_TEMPLATE,
  USER_TURN_PROMPT_TEMPLATE,
} from './prompts/templates';

function compactHistory(messages: StudioMessageRecord[]): string {
  return messages
    .slice(-20)
    .map((message) => `${message.role.toUpperCase()}: ${message.visible_text}`)
    .join('\n');
}

function compactArtifacts(artifacts: StudioCurrentArtifactSet): string {
  const keys = Object.keys(artifacts);
  if (keys.length === 0) {
    return 'No existing artifacts yet.';
  }

  return JSON.stringify(artifacts, null, 2);
}

function compactPhaseSchema(phase: StudioPhase): string {
  return JSON.stringify(responseJsonSchemaForPhase(phase));
}

function compactZodOutputSchema(phase: StudioPhase): string {
  return JSON.stringify(responseZodJsonSchemaForPhase(phase));
}

function safeSerialize(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2) ?? 'null';
  } catch {
    return '[unserializable payload]';
  }
}

function phaseInstructionPrompt(phase: StudioPhase): string {
  switch (phase) {
    case 'phase1_define':
      return PHASE1_DEFINE_SYSTEM_PROMPT;
    case 'phase2_plan':
      return PHASE2_PLAN_SYSTEM_PROMPT;
    case 'phase3_generate':
      return PHASE3_GENERATE_SYSTEM_PROMPT;
    case 'phase4_tweak':
      return PHASE4_TWEAK_SYSTEM_PROMPT;
  }
}

export function buildSystemPrompt(phase: StudioPhase): string {
  const baseRules = renderPromptTemplate(BASE_SYSTEM_RULES_PROMPT, {
    zod_output_schema: compactZodOutputSchema(phase),
  });

  return renderPromptTemplate(SYSTEM_PROMPT_TEMPLATE, {
    base_rules: baseRules,
    phase_instruction: phaseInstructionPrompt(phase),
  });
}

export function buildUserPrompt(input: {
  phase: StudioPhase;
  userMessage: string;
  messages: StudioMessageRecord[];
  currentArtifacts: StudioCurrentArtifactSet;
}): string {
  const history = compactHistory(input.messages);
  const artifacts = compactArtifacts(input.currentArtifacts);
  const phaseSchema = compactPhaseSchema(input.phase);

  return renderPromptTemplate(USER_TURN_PROMPT_TEMPLATE, {
    phase: input.phase,
    canonical_schema_primer: CANONICAL_SCHEMA_PRIMER_PROMPT,
    phase_schema: phaseSchema,
    user_message: input.userMessage,
    conversation_history: history || 'No prior messages.',
    current_artifacts: artifacts,
  });
}

export function buildRepairPrompt(input: {
  phase: StudioPhase;
  userMessage: string;
  validationError: string;
  previousAttemptPayload: unknown;
  messages: StudioMessageRecord[];
  currentArtifacts: StudioCurrentArtifactSet;
}): string {
  const history = compactHistory(input.messages);
  const artifacts = compactArtifacts(input.currentArtifacts);
  const phaseSchema = compactPhaseSchema(input.phase);

  return renderPromptTemplate(REPAIR_TURN_PROMPT_TEMPLATE, {
    phase: input.phase,
    canonical_schema_primer: CANONICAL_SCHEMA_PRIMER_PROMPT,
    phase_schema: phaseSchema,
    validation_error: input.validationError,
    previous_invalid_output: safeSerialize(input.previousAttemptPayload),
    user_message: input.userMessage,
    conversation_history: history || 'No prior messages.',
    current_artifacts: artifacts,
  });
}
