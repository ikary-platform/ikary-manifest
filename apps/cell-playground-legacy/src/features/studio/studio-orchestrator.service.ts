import type {
  Phase1Output,
  Phase2Output,
  Phase3Output,
  Phase4Output,
  StudioCurrentArtifactSet,
  StudioDebugTraceEvent,
  StudioLlmExchangeLogger,
  StudioOrchestrationResult,
  StudioPhase,
  StudioSessionRecord,
  StudioTraceLogger,
} from './contracts';
import { applyReplacementArtifacts, assembleManifest } from './artifact-assembler';
import { applyPatchOperations } from './patch-engine';
import { buildRepairPrompt, buildSystemPrompt, buildUserPrompt } from './phase-prompts';
import { OpenAiResponsesClient, OpenAiResponsesRequestError } from './openai-responses.client';
import { StudioArtifactService } from './studio-artifact.service';
import { StudioMessageService } from './studio-message.service';
import { StudioPreviewService } from './studio-preview.service';
import { StudioSessionService } from './studio-session.service';
import { getStatusWord, getRandomStatusWord } from './status-words';
import {
  validateCurrentArtifactsForPreview,
  validateDiscoveryCompletion,
  validateInitialGeneration,
  validatePatchOperations,
  validatePhaseOutput,
} from './validators';

function resolveMaxRetries(): number {
  const rawValue =
    typeof import.meta !== 'undefined' ? (import.meta.env.VITE_STUDIO_MAX_RETRIES as string | undefined) : undefined;
  const parsed = Number.parseInt(rawValue ?? '', 10);
  if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 20) {
    return parsed;
  }
  return 6;
}

const MAX_RETRIES = resolveMaxRetries();

function sanitizeVisibleAssistantText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return text;
  }

  try {
    JSON.parse(trimmed);
    return 'I updated the Cell artifacts and refreshed the preview.';
  } catch {
    return text;
  }
}

interface RetryExecutionResult {
  parsed: unknown;
  retriesUsed: number;
  statusWord: string;
}

interface RetryExecutionOptions {
  requirePhase4Mode?: Phase4Output['mode'];
}

interface RetryAttemptContext {
  attempt: number;
  maxRetries: number;
  phase: StudioPhase;
}

interface Phase4ApplyOutcome {
  assistantText: string;
  validationError: string | null;
  requestReplacementFallback: boolean;
  fallbackReason: string | null;
}

function traceEvent(logger: StudioTraceLogger | undefined, event: Omit<StudioDebugTraceEvent, 'at'>): void {
  if (!logger) {
    return;
  }

  logger({
    at: new Date().toISOString(),
    ...event,
  });
}

export class StudioOrchestratorService {
  constructor(
    private readonly sessionService: StudioSessionService,
    private readonly messageService: StudioMessageService,
    private readonly artifactService: StudioArtifactService,
    private readonly previewService: StudioPreviewService,
    private readonly openAiClient: OpenAiResponsesClient,
  ) {}

  ensureSession(): StudioSessionRecord {
    return this.sessionService.ensureSession();
  }

  getCurrentArtifacts(sessionId: string): StudioCurrentArtifactSet {
    return this.artifactService.getCurrentArtifactSet(sessionId);
  }

  private executeWithRetries(
    phase: StudioPhase,
    session: StudioSessionRecord,
    userMessage: string,
    onStatus?: (word: string) => void,
    onTrace?: StudioTraceLogger,
    onLlmExchange?: StudioLlmExchangeLogger,
    options: RetryExecutionOptions = {},
  ): Promise<RetryExecutionResult> {
    return (async () => {
      let previousInvalidPayload: unknown = null;
      let previousError = 'unknown validation error';

      traceEvent(onTrace, {
        source: 'studio-orchestrator',
        component: 'StudioOrchestratorService',
        stage: 'executeWithRetries.start',
        level: 'info',
        message: 'Starting OpenAI generation with retries.',
        details: { phase, maxRetries: MAX_RETRIES },
      });

      for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
        const statusWord = getStatusWord(attempt);
        onStatus?.(statusWord);
        const attemptContext: RetryAttemptContext = {
          attempt: attempt + 1,
          maxRetries: MAX_RETRIES,
          phase,
        };

        traceEvent(onTrace, {
          source: 'studio-orchestrator',
          component: 'StudioOrchestratorService',
          stage: 'executeWithRetries.attempt',
          level: 'info',
          message: `Attempt ${attemptContext.attempt}/${attemptContext.maxRetries}.`,
          details: { ...attemptContext, statusWord },
        });

        const messages = this.messageService.list(session.id);
        const currentArtifacts = this.artifactService.getCurrentArtifactSet(session.id);

        const systemPrompt = buildSystemPrompt(phase);
        const userPrompt =
          attempt === 0
            ? buildUserPrompt({ phase, userMessage, messages, currentArtifacts })
            : buildRepairPrompt({
                phase,
                userMessage,
                validationError: previousError,
                previousAttemptPayload: previousInvalidPayload,
                messages,
                currentArtifacts,
              });

        try {
          traceEvent(onTrace, {
            source: 'llm',
            component: 'OpenAiResponsesClient',
            stage: 'responses.request',
            level: 'info',
            message: 'Sending structured generation request to OpenAI Responses API.',
            details: {
              ...attemptContext,
              model: this.openAiClient.getModel(),
              prompt: {
                systemChars: systemPrompt.length,
                userChars: userPrompt.length,
              },
            },
          });

          const response = await this.openAiClient.generateStructured({
            phase,
            systemPrompt,
            userPrompt,
          });

          onLlmExchange?.({
            at: new Date().toISOString(),
            phase,
            attempt: attemptContext.attempt,
            max_retries: attemptContext.maxRetries,
            model: this.openAiClient.getModel(),
            system_prompt: systemPrompt,
            user_prompt: userPrompt,
            request_body: response.requestBody,
            response_payload: response.payload,
            response_raw: response.rawResponse,
          });

          traceEvent(onTrace, {
            source: 'llm',
            component: 'OpenAiResponsesClient',
            stage: 'responses.response',
            level: 'info',
            message: 'Received OpenAI response payload.',
            details: {
              ...attemptContext,
              payloadType: typeof response.payload,
              hasRawResponse: response.rawResponse !== undefined,
            },
          });

          const parseResult = validatePhaseOutput(phase, response.payload);
          if (!parseResult.ok) {
            previousInvalidPayload = response.payload;
            previousError = parseResult.errors.join('; ');
            traceEvent(onTrace, {
              source: 'studio-validation',
              component: 'validatePhaseOutput',
              stage: 'phase.output.schema',
              level: 'error',
              message: previousError,
              details: {
                ...attemptContext,
                errors: parseResult.errors,
                payload: response.payload,
              },
            });
            continue;
          }

          const parsed = parseResult.parsed;

          if (phase === 'phase3_generate') {
            const generation = (parsed as Phase3Output).initial_generation;
            const generationValidation = validateInitialGeneration(generation);
            if (!generationValidation.ok) {
              previousInvalidPayload = response.payload;
              previousError = generationValidation.errors.join('; ');
              traceEvent(onTrace, {
                source: 'studio-validation',
                component: 'validateInitialGeneration',
                stage: 'phase3.initial_generation',
                level: 'error',
                message: previousError,
                details: {
                  ...attemptContext,
                  errors: generationValidation.errors,
                },
              });
              continue;
            }
          }

          if (phase === 'phase4_tweak') {
            const phase4 = parsed as Phase4Output;
            if (options.requirePhase4Mode && phase4.mode !== options.requirePhase4Mode) {
              previousInvalidPayload = response.payload;
              previousError = `Expected phase4 mode=${options.requirePhase4Mode}, got mode=${phase4.mode}`;
              traceEvent(onTrace, {
                source: 'studio-validation',
                component: 'StudioOrchestratorService',
                stage: 'phase4.mode',
                level: 'error',
                message: previousError,
                details: {
                  ...attemptContext,
                  expected: options.requirePhase4Mode,
                  actual: phase4.mode,
                },
              });
              continue;
            }

            if (phase4.mode === 'patch') {
              const patchValidation = validatePatchOperations(phase4.patch?.patch_operations ?? []);
              if (!patchValidation.ok) {
                previousInvalidPayload = response.payload;
                previousError = patchValidation.errors.join('; ');
                traceEvent(onTrace, {
                  source: 'studio-validation',
                  component: 'validatePatchOperations',
                  stage: 'phase4.patch.operations',
                  level: 'error',
                  message: previousError,
                  details: {
                    ...attemptContext,
                    errors: patchValidation.errors,
                  },
                });
                continue;
              }
            }
          }

          traceEvent(onTrace, {
            source: 'studio-orchestrator',
            component: 'StudioOrchestratorService',
            stage: 'executeWithRetries.success',
            level: 'info',
            message: `Attempt ${attemptContext.attempt} succeeded.`,
            details: attemptContext,
          });

          return {
            parsed,
            retriesUsed: attempt,
            statusWord,
          };
        } catch (error) {
          if (error instanceof OpenAiResponsesRequestError) {
            onLlmExchange?.({
              at: new Date().toISOString(),
              phase,
              attempt: attemptContext.attempt,
              max_retries: attemptContext.maxRetries,
              model: this.openAiClient.getModel(),
              system_prompt: systemPrompt,
              user_prompt: userPrompt,
              request_body: error.requestBody,
              error_message: error.message,
              error_response: error.responseBody,
            });
          } else {
            onLlmExchange?.({
              at: new Date().toISOString(),
              phase,
              attempt: attemptContext.attempt,
              max_retries: attemptContext.maxRetries,
              model: this.openAiClient.getModel(),
              system_prompt: systemPrompt,
              user_prompt: userPrompt,
              error_message: error instanceof Error ? error.message : 'unknown error',
            });
          }

          previousInvalidPayload = { error: error instanceof Error ? error.message : 'unknown error' };
          previousError = error instanceof Error ? error.message : 'unknown error';
          traceEvent(onTrace, {
            source: 'llm',
            component: 'OpenAiResponsesClient',
            stage: 'responses.error',
            level: 'error',
            message: previousError,
            details: attemptContext,
          });
        }
      }

      traceEvent(onTrace, {
        source: 'studio-orchestrator',
        component: 'StudioOrchestratorService',
        stage: 'executeWithRetries.exhausted',
        level: 'error',
        message: previousError,
        details: { phase, maxRetries: MAX_RETRIES },
      });

      throw new Error(`Studio generation failed after ${MAX_RETRIES} attempts: ${previousError}`);
    })();
  }

  async runUserTurn(
    userMessage: string,
    onStatus?: (word: string) => void,
    onTrace?: StudioTraceLogger,
    onLlmExchange?: StudioLlmExchangeLogger,
  ): Promise<StudioOrchestrationResult> {
    const session = this.sessionService.ensureSession();
    this.messageService.appendUser(session.id, userMessage);
    traceEvent(onTrace, {
      source: 'storage',
      component: 'StudioMessageService',
      stage: 'message.append.user',
      level: 'info',
      message: 'Stored user message.',
      details: { sessionId: session.id, chars: userMessage.length },
    });

    const persistedPhase = this.sessionService.getSession()?.current_phase ?? 'phase1_define';
    const effectivePhase: StudioPhase = persistedPhase === 'phase3_generate' ? 'phase4_tweak' : persistedPhase;
    traceEvent(onTrace, {
      source: 'studio-orchestrator',
      component: 'StudioOrchestratorService',
      stage: 'runUserTurn.start',
      level: 'info',
      message: 'Running user turn.',
      details: { persistedPhase, effectivePhase, sessionId: session.id },
    });

    if (effectivePhase !== persistedPhase) {
      this.sessionService.setPhase('phase4_tweak');
      traceEvent(onTrace, {
        source: 'storage',
        component: 'StudioSessionService',
        stage: 'phase.transition',
        level: 'info',
        message: 'Auto-transitioned phase3_generate -> phase4_tweak for user turns.',
        details: { from: persistedPhase, to: 'phase4_tweak' },
      });
    }

    try {
      const execution = await this.executeWithRetries(
        effectivePhase,
        session,
        userMessage,
        onStatus,
        onTrace,
        onLlmExchange,
      );
      const parsed = execution.parsed;

      if (effectivePhase === 'phase1_define') {
        const payload = parsed as Phase1Output;
        const assistantText = sanitizeVisibleAssistantText(payload.assistant_visible_text);
        const artifact = this.artifactService.putCurrent(session.id, 'discovery', effectivePhase, payload.discovery);
        traceEvent(onTrace, {
          source: 'storage',
          component: 'StudioArtifactService',
          stage: 'artifact.put.discovery',
          level: 'info',
          message: 'Stored current discovery artifact.',
          details: { version: artifact.version, phase: effectivePhase },
        });

        const completion = validateDiscoveryCompletion(payload.discovery);
        if (completion.ok) {
          this.sessionService.setPhase('phase2_plan');
          traceEvent(onTrace, {
            source: 'studio-validation',
            component: 'validateDiscoveryCompletion',
            stage: 'phase1.completion',
            level: 'info',
            message: 'Discovery complete. Transitioning to Phase 2.',
            details: { nextPhase: 'phase2_plan' },
          });
        } else {
          traceEvent(onTrace, {
            source: 'studio-validation',
            component: 'validateDiscoveryCompletion',
            stage: 'phase1.completion',
            level: 'warn',
            message: completion.errors.join('; '),
            details: { errors: completion.errors },
          });
        }

        this.messageService.appendAssistant(session.id, assistantText);
        traceEvent(onTrace, {
          source: 'storage',
          component: 'StudioMessageService',
          stage: 'message.append.assistant',
          level: 'info',
          message: 'Stored assistant response.',
          details: { chars: assistantText.length, phase: effectivePhase },
        });

        return {
          phase: this.sessionService.getSession()?.current_phase ?? effectivePhase,
          assistantText: assistantText,
          validationError: completion.ok ? null : completion.errors.join('; '),
          retriesUsed: execution.retriesUsed,
          statusWord: execution.statusWord,
        };
      }

      if (effectivePhase === 'phase2_plan') {
        const payload = parsed as Phase2Output;
        const assistantText = sanitizeVisibleAssistantText(payload.assistant_visible_text);
        const artifact = this.artifactService.putCurrent(session.id, 'plan', effectivePhase, payload.plan);
        traceEvent(onTrace, {
          source: 'storage',
          component: 'StudioArtifactService',
          stage: 'artifact.put.plan',
          level: 'info',
          message: 'Stored current plan artifact.',
          details: { version: artifact.version, phase: effectivePhase, generationReady: payload.plan.generation_ready },
        });
        this.messageService.appendAssistant(session.id, assistantText);
        traceEvent(onTrace, {
          source: 'storage',
          component: 'StudioMessageService',
          stage: 'message.append.assistant',
          level: 'info',
          message: 'Stored assistant response.',
          details: { chars: assistantText.length, phase: effectivePhase },
        });

        return {
          phase: effectivePhase,
          assistantText: assistantText,
          validationError: null,
          retriesUsed: execution.retriesUsed,
          statusWord: execution.statusWord,
        };
      }

      if (effectivePhase === 'phase4_tweak') {
        const outcome = this.applyPhase4Result(session, parsed as Phase4Output, onTrace);

        if (outcome.requestReplacementFallback) {
          traceEvent(onTrace, {
            source: 'studio-orchestrator',
            component: 'StudioOrchestratorService',
            stage: 'phase4.fallback',
            level: 'warn',
            message: outcome.fallbackReason ?? 'Patch fallback requested.',
          });

          const fallbackPrompt = [
            userMessage,
            '',
            `Patch application failed in Studio validation: ${outcome.fallbackReason ?? 'unknown reason'}.`,
            'Return mode="replacement" with replacement_artifacts that preserve existing valid parts and include only required changes.',
          ].join('\n');

          const fallbackExecution = await this.executeWithRetries(
            'phase4_tweak',
            session,
            fallbackPrompt,
            onStatus,
            onTrace,
            onLlmExchange,
            { requirePhase4Mode: 'replacement' },
          );

          const fallbackOutcome = this.applyPhase4Result(session, fallbackExecution.parsed as Phase4Output, onTrace);
          this.messageService.appendAssistant(session.id, fallbackOutcome.assistantText);
          traceEvent(onTrace, {
            source: 'storage',
            component: 'StudioMessageService',
            stage: 'message.append.assistant',
            level: 'info',
            message: 'Stored assistant fallback response.',
            details: { chars: fallbackOutcome.assistantText.length, phase: 'phase4_tweak' },
          });

          return {
            phase: 'phase4_tweak',
            assistantText: fallbackOutcome.assistantText,
            validationError: fallbackOutcome.validationError,
            retriesUsed: execution.retriesUsed + fallbackExecution.retriesUsed + 1,
            statusWord: fallbackExecution.statusWord,
          };
        }

        this.messageService.appendAssistant(session.id, outcome.assistantText);
        traceEvent(onTrace, {
          source: 'storage',
          component: 'StudioMessageService',
          stage: 'message.append.assistant',
          level: 'info',
          message: 'Stored assistant response.',
          details: { chars: outcome.assistantText.length, phase: 'phase4_tweak' },
        });

        return {
          phase: 'phase4_tweak',
          assistantText: outcome.assistantText,
          validationError: outcome.validationError,
          retriesUsed: execution.retriesUsed,
          statusWord: execution.statusWord,
        };
      }

      return {
        phase: effectivePhase,
        assistantText: 'Studio state was updated.',
        validationError: null,
        retriesUsed: execution.retriesUsed,
        statusWord: execution.statusWord,
      };
    } catch (error) {
      const safeMessage = `I could not complete this step yet. ${error instanceof Error ? error.message : 'Please try again.'}`;
      this.messageService.appendAssistant(session.id, safeMessage);
      onStatus?.(getRandomStatusWord());
      traceEvent(onTrace, {
        source: 'studio-orchestrator',
        component: 'StudioOrchestratorService',
        stage: 'runUserTurn.error',
        level: 'error',
        message: error instanceof Error ? error.message : 'Unknown runUserTurn error.',
      });
      traceEvent(onTrace, {
        source: 'storage',
        component: 'StudioMessageService',
        stage: 'message.append.assistant',
        level: 'info',
        message: 'Stored assistant error response.',
        details: { chars: safeMessage.length, phase: effectivePhase },
      });

      return {
        phase: this.sessionService.getSession()?.current_phase ?? effectivePhase,
        assistantText: safeMessage,
        validationError: safeMessage,
        retriesUsed: MAX_RETRIES,
        statusWord: getRandomStatusWord(),
      };
    }
  }

  async generateInitial(
    onStatus?: (word: string) => void,
    onTrace?: StudioTraceLogger,
    onLlmExchange?: StudioLlmExchangeLogger,
  ): Promise<StudioOrchestrationResult> {
    const session = this.sessionService.ensureSession();
    const currentPhase = this.sessionService.getSession()?.current_phase ?? 'phase1_define';
    traceEvent(onTrace, {
      source: 'studio-orchestrator',
      component: 'StudioOrchestratorService',
      stage: 'generateInitial.start',
      level: 'info',
      message: 'Starting initial generation.',
      details: { currentPhase, sessionId: session.id },
    });

    if (currentPhase !== 'phase2_plan') {
      const text = 'Generation is available only after planning. Complete Phase 2 first.';
      this.messageService.appendAssistant(session.id, text);
      traceEvent(onTrace, {
        source: 'studio-orchestrator',
        component: 'StudioOrchestratorService',
        stage: 'generateInitial.blocked',
        level: 'warn',
        message: text,
        details: { currentPhase },
      });
      return {
        phase: currentPhase,
        assistantText: text,
        validationError: text,
        retriesUsed: 0,
        statusWord: getRandomStatusWord(),
      };
    }

    try {
      const execution = await this.executeWithRetries(
        'phase3_generate',
        session,
        'Generate the first runnable Cell now using the approved plan.',
        onStatus,
        onTrace,
        onLlmExchange,
      );

      const payload = execution.parsed as Phase3Output;
      const assistantText = sanitizeVisibleAssistantText(payload.assistant_visible_text);
      const generation = payload.initial_generation;
      const validation = validateInitialGeneration(generation);

      if (!validation.ok) {
        const text = `Generation failed validation: ${validation.errors.join('; ')}`;
        this.messageService.appendAssistant(session.id, text);
        traceEvent(onTrace, {
          source: 'studio-validation',
          component: 'validateInitialGeneration',
          stage: 'phase3.generation.validation',
          level: 'error',
          message: text,
          details: { errors: validation.errors },
        });
        return {
          phase: 'phase2_plan',
          assistantText: text,
          validationError: text,
          retriesUsed: execution.retriesUsed,
          statusWord: execution.statusWord,
        };
      }

      this.artifactService.putManyCurrent(session.id, 'phase3_generate', [
        { type: 'manifest', payload: generation.cell_manifest },
        { type: 'entity_schema', payload: generation.entity_schemas },
        { type: 'layout', payload: generation.layouts },
        { type: 'action', payload: generation.actions },
        { type: 'permission', payload: generation.permissions },
      ]);
      traceEvent(onTrace, {
        source: 'storage',
        component: 'StudioArtifactService',
        stage: 'artifact.putMany.phase3',
        level: 'info',
        message: 'Stored phase 3 initial artifact set.',
        details: {
          manifest: true,
          entities: generation.entity_schemas.length,
          layouts: generation.layouts.length,
          actions: generation.actions.length,
          permissions: generation.permissions.length,
        },
      });

      this.sessionService.setPhase('phase4_tweak');
      traceEvent(onTrace, {
        source: 'storage',
        component: 'StudioSessionService',
        stage: 'phase.transition',
        level: 'info',
        message: 'Transitioned phase3_generate -> phase4_tweak.',
        details: { from: 'phase2_plan', to: 'phase4_tweak' },
      });
      this.messageService.appendAssistant(session.id, assistantText);
      traceEvent(onTrace, {
        source: 'storage',
        component: 'StudioMessageService',
        stage: 'message.append.assistant',
        level: 'info',
        message: 'Stored assistant generation response.',
        details: { chars: assistantText.length, phase: 'phase3_generate' },
      });

      return {
        phase: 'phase4_tweak',
        assistantText: assistantText,
        validationError: null,
        retriesUsed: execution.retriesUsed,
        statusWord: execution.statusWord,
      };
    } catch (error) {
      const text = `I could not complete generation yet. ${error instanceof Error ? error.message : 'Please try again.'}`;
      this.messageService.appendAssistant(session.id, text);
      traceEvent(onTrace, {
        source: 'studio-orchestrator',
        component: 'StudioOrchestratorService',
        stage: 'generateInitial.error',
        level: 'error',
        message: error instanceof Error ? error.message : 'Unknown generateInitial error.',
      });
      traceEvent(onTrace, {
        source: 'storage',
        component: 'StudioMessageService',
        stage: 'message.append.assistant',
        level: 'info',
        message: 'Stored assistant generation error response.',
        details: { chars: text.length, phase: currentPhase },
      });
      return {
        phase: currentPhase,
        assistantText: text,
        validationError: text,
        retriesUsed: MAX_RETRIES,
        statusWord: getRandomStatusWord(),
      };
    }
  }

  private applyPhase4Result(
    session: StudioSessionRecord,
    payload: Phase4Output,
    onTrace?: StudioTraceLogger,
  ): Phase4ApplyOutcome {
    const current = this.artifactService.getCurrentArtifactSet(session.id);
    traceEvent(onTrace, {
      source: 'studio-orchestrator',
      component: 'StudioOrchestratorService',
      stage: 'phase4.apply.start',
      level: 'info',
      message: 'Applying Phase 4 result.',
      details: { mode: payload.mode },
    });

    if (payload.mode === 'patch') {
      const operations = payload.patch?.patch_operations ?? [];
      const patchValidation = validatePatchOperations(operations);
      if (!patchValidation.ok) {
        traceEvent(onTrace, {
          source: 'studio-validation',
          component: 'validatePatchOperations',
          stage: 'phase4.patch.validation',
          level: 'error',
          message: patchValidation.errors.join('; '),
          details: { errors: patchValidation.errors },
        });
        return {
          assistantText: 'I am switching to a safer full update for this tweak.',
          validationError: patchValidation.errors.join('; '),
          requestReplacementFallback: true,
          fallbackReason: patchValidation.errors.join('; '),
        };
      }

      const patchResult = applyPatchOperations(current, operations);
      if (!patchResult.ok) {
        traceEvent(onTrace, {
          source: 'studio-patch',
          component: 'applyPatchOperations',
          stage: 'phase4.patch.apply',
          level: 'error',
          message: patchResult.errors.join('; '),
          details: { errors: patchResult.errors, operationCount: operations.length },
        });
        return {
          assistantText: 'I am switching to a safer full update for this tweak.',
          validationError: patchResult.errors.join('; '),
          requestReplacementFallback: true,
          fallbackReason: patchResult.errors.join('; '),
        };
      }

      const assembledManifest = assembleManifest(patchResult.next);
      if (!assembledManifest) {
        traceEvent(onTrace, {
          source: 'studio-preview',
          component: 'assembleManifest',
          stage: 'phase4.patch.manifest',
          level: 'error',
          message: 'No manifest after patch.',
        });
        return {
          assistantText: 'I am switching to a safer full update for this tweak.',
          validationError: 'No manifest after patch.',
          requestReplacementFallback: true,
          fallbackReason: 'No manifest after patch.',
        };
      }

      const previewValidation = validateCurrentArtifactsForPreview({
        ...patchResult.next,
        manifest: assembledManifest,
      });

      if (!previewValidation.ok) {
        traceEvent(onTrace, {
          source: 'studio-preview',
          component: 'validateCurrentArtifactsForPreview',
          stage: 'phase4.patch.preview_validation',
          level: 'error',
          message: previewValidation.errors.join('; '),
          details: { errors: previewValidation.errors },
        });
        return {
          assistantText: 'I am switching to a safer full update for this tweak.',
          validationError: previewValidation.errors.join('; '),
          requestReplacementFallback: true,
          fallbackReason: previewValidation.errors.join('; '),
        };
      }

      this.artifactService.putCurrent(session.id, 'patch', 'phase4_tweak', { patch_operations: operations });
      this.artifactService.putCurrent(session.id, 'manifest', 'phase4_tweak', assembledManifest);
      this.artifactService.putCurrent(
        session.id,
        'entity_schema',
        'phase4_tweak',
        patchResult.next.entity_schema ?? [],
      );
      this.artifactService.putCurrent(session.id, 'layout', 'phase4_tweak', patchResult.next.layout ?? []);
      this.artifactService.putCurrent(session.id, 'action', 'phase4_tweak', patchResult.next.action ?? []);
      this.artifactService.putCurrent(session.id, 'permission', 'phase4_tweak', patchResult.next.permission ?? []);
      traceEvent(onTrace, {
        source: 'storage',
        component: 'StudioArtifactService',
        stage: 'phase4.patch.persist',
        level: 'info',
        message: 'Persisted patch and updated current artifacts.',
        details: { operationCount: operations.length },
      });

      return {
        assistantText: sanitizeVisibleAssistantText(payload.assistant_visible_text),
        validationError: null,
        requestReplacementFallback: false,
        fallbackReason: null,
      };
    }

    const replacement = payload.replacement_artifacts;
    if (!replacement) {
      traceEvent(onTrace, {
        source: 'studio-validation',
        component: 'StudioOrchestratorService',
        stage: 'phase4.replacement.payload',
        level: 'error',
        message: 'Missing replacement_artifacts for replacement mode.',
      });
      return {
        assistantText: 'No replacement artifacts were provided for this tweak.',
        validationError: 'Missing replacement artifacts.',
        requestReplacementFallback: false,
        fallbackReason: null,
      };
    }

    const replaced = applyReplacementArtifacts(current, replacement);
    const assembledManifest = assembleManifest(replaced);

    if (!assembledManifest) {
      traceEvent(onTrace, {
        source: 'studio-preview',
        component: 'assembleManifest',
        stage: 'phase4.replacement.manifest',
        level: 'error',
        message: 'Replacement artifacts were incomplete and could not produce a manifest.',
      });
      return {
        assistantText: 'Replacement artifacts were incomplete and could not produce a manifest.',
        validationError: 'Incomplete replacement artifacts.',
        requestReplacementFallback: false,
        fallbackReason: null,
      };
    }

    const previewValidation = validateCurrentArtifactsForPreview({
      ...replaced,
      manifest: assembledManifest,
    });

    if (!previewValidation.ok) {
      traceEvent(onTrace, {
        source: 'studio-preview',
        component: 'validateCurrentArtifactsForPreview',
        stage: 'phase4.replacement.preview_validation',
        level: 'error',
        message: previewValidation.errors.join('; '),
        details: { errors: previewValidation.errors },
      });
      return {
        assistantText: `I kept the previous version because validation failed: ${previewValidation.errors.join('; ')}`,
        validationError: previewValidation.errors.join('; '),
        requestReplacementFallback: false,
        fallbackReason: null,
      };
    }

    this.artifactService.putCurrent(session.id, 'manifest', 'phase4_tweak', assembledManifest);
    if (replacement.entity_schemas) {
      this.artifactService.putCurrent(session.id, 'entity_schema', 'phase4_tweak', replacement.entity_schemas);
    }
    if (replacement.layouts) {
      this.artifactService.putCurrent(session.id, 'layout', 'phase4_tweak', replacement.layouts);
    }
    if (replacement.actions) {
      this.artifactService.putCurrent(session.id, 'action', 'phase4_tweak', replacement.actions);
    }
    if (replacement.permissions) {
      this.artifactService.putCurrent(session.id, 'permission', 'phase4_tweak', replacement.permissions);
    }
    traceEvent(onTrace, {
      source: 'storage',
      component: 'StudioArtifactService',
      stage: 'phase4.replacement.persist',
      level: 'info',
      message: 'Persisted replacement artifacts.',
      details: {
        hasManifest: Boolean(replacement.cell_manifest),
        entitySchemaCount: replacement.entity_schemas?.length ?? null,
        layoutCount: replacement.layouts?.length ?? null,
      },
    });

    return {
      assistantText: sanitizeVisibleAssistantText(payload.assistant_visible_text),
      validationError: null,
      requestReplacementFallback: false,
      fallbackReason: null,
    };
  }

  buildPreviewModel(onTrace?: StudioTraceLogger) {
    const session = this.sessionService.ensureSession();
    const currentArtifacts = this.artifactService.getCurrentArtifactSet(session.id);
    const previewModel = this.previewService.build(currentArtifacts);
    traceEvent(onTrace, {
      source: 'studio-preview',
      component: 'StudioPreviewService',
      stage: 'preview.build',
      level: previewModel.compileErrors.length > 0 ? 'warn' : 'info',
      message:
        previewModel.compileErrors.length > 0 ? 'Preview built with compile errors.' : 'Preview built successfully.',
      details: {
        compileErrorCount: previewModel.compileErrors.length,
        hasManifest: Boolean(previewModel.compiledManifest),
      },
    });
    return previewModel;
  }
}
