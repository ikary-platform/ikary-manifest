import type { StudioCurrentArtifactSet, StudioMessageRecord, StudioPhase } from './contracts';
import { responseJsonSchemaForPhase, responseZodJsonSchemaForPhase } from './phase-schemas';
import { studioPromptRegistry } from './prompts/registry';

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

function phaseInstructionPromptName(phase: StudioPhase): string {
  switch (phase) {
    case 'phase1_define':
      return 'cell-playground/phase1-define';
    case 'phase2_plan':
      return 'cell-playground/phase2-plan';
    case 'phase3_generate':
      return 'cell-playground/phase3-generate';
    case 'phase4_tweak':
      return 'cell-playground/phase4-tweak';
  }
}

export function buildSystemPrompt(phase: StudioPhase): string {
  const baseRules = studioPromptRegistry.render('cell-playground/base-system-rules', {
    zod_output_schema: compactZodOutputSchema(phase),
  });
  const phaseInstruction = studioPromptRegistry.render(phaseInstructionPromptName(phase));
  return studioPromptRegistry.render('cell-playground/system', {
    base_rules: baseRules,
    phase_instruction: phaseInstruction,
  });
}

export function buildUserPrompt(input: {
  phase: StudioPhase;
  userMessage: string;
  messages: StudioMessageRecord[];
  currentArtifacts: StudioCurrentArtifactSet;
}): string {
  return studioPromptRegistry.render('cell-playground/user-turn', {
    phase: input.phase,
    canonical_schema_primer: studioPromptRegistry.render('cell-playground/canonical-schema-primer'),
    phase_schema: compactPhaseSchema(input.phase),
    user_message: input.userMessage,
    conversation_history: compactHistory(input.messages) || 'No prior messages.',
    current_artifacts: compactArtifacts(input.currentArtifacts),
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
  return studioPromptRegistry.render('cell-playground/repair-turn', {
    phase: input.phase,
    canonical_schema_primer: studioPromptRegistry.render('cell-playground/canonical-schema-primer'),
    phase_schema: compactPhaseSchema(input.phase),
    validation_error: input.validationError,
    previous_invalid_output: safeSerialize(input.previousAttemptPayload),
    user_message: input.userMessage,
    conversation_history: compactHistory(input.messages) || 'No prior messages.',
    current_artifacts: compactArtifacts(input.currentArtifacts),
  });
}
