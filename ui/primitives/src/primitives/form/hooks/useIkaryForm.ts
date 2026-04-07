import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  FormConflictState,
  FormFieldErrors,
  FormRuntimeError,
  FormStatus,
  FormValues,
  UseIkaryFormInput,
  UseIkaryFormResult,
} from '../Form.types';
import { buildFormSectionViewModel } from '../../form-section/FormSection.adapter';
import type { FormFieldPresentation, FormSectionPresentation } from '@ikary/presentation';

const STATUS_FLASH_MS = 1200;

export function useIkaryForm(input: UseIkaryFormInput): UseIkaryFormResult {
  const { config, runtime } = input;

  const [values, setValues] = useState<FormValues>(() => resolveDraftInputValues(runtime));
  const [draftBaseline, setDraftBaseline] = useState<FormValues>(() => resolveDraftInputValues(runtime));
  const [committedBaseline, setCommittedBaseline] = useState<FormValues>(() =>
    resolveCommittedInputValues(runtime, config.mode),
  );
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>(() => ({ ...(runtime.fieldErrors ?? {}) }));
  const [formError, setFormError] = useState<string | undefined>(runtime.formError);
  const [conflict, setConflict] = useState<FormConflictState | undefined>(runtime.conflict);
  const [locked, setLocked] = useState<boolean>(runtime.locked ?? false);
  const [lockReason, setLockReason] = useState<string | undefined>(runtime.lockReason);
  const [lastSavedAt, setLastSavedAt] = useState<string | undefined>(runtime.lastSavedAt);

  const [savingDraft, setSavingDraft] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [statusFlash, setStatusFlash] = useState<FormStatus | undefined>();

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() =>
    resolveInitialExpandedSections(config.sections, runtime.expandedSections),
  );

  const draftRequestTokenRef = useRef(0);

  const externalCommittedValues = useMemo(
    () => resolveCommittedInputValues(runtime, config.mode),
    [config.mode, runtime.initialValues, runtime.draftValues],
  );
  const externalDraftValues = useMemo(
    () => resolveDraftInputValues(runtime),
    [runtime.draftValues, runtime.initialValues],
  );
  const externalInputSignature = useMemo(
    () => ({
      committed: serializeValues(externalCommittedValues),
      draft: serializeValues(externalDraftValues),
    }),
    [externalCommittedValues, externalDraftValues],
  );
  const externalInputSignatureRef = useRef(externalInputSignature);

  const loading = runtime.loading ?? false;

  const localDirty = useMemo(() => !areValuesEqual(values, draftBaseline), [values, draftBaseline]);
  const draftDirty = useMemo(
    () => !areValuesEqual(draftBaseline, committedBaseline),
    [draftBaseline, committedBaseline],
  );
  const remoteStale = Boolean(conflict);

  useEffect(() => {
    setFieldErrors({ ...(runtime.fieldErrors ?? {}) });
  }, [runtime.fieldErrors]);

  useEffect(() => {
    setFormError(runtime.formError);
  }, [runtime.formError]);

  useEffect(() => {
    setConflict(runtime.conflict);
  }, [runtime.conflict]);

  useEffect(() => {
    setLocked(runtime.locked ?? false);
  }, [runtime.locked]);

  useEffect(() => {
    setLockReason(runtime.lockReason);
  }, [runtime.lockReason]);

  useEffect(() => {
    setLastSavedAt(runtime.lastSavedAt);
  }, [runtime.lastSavedAt]);

  useEffect(() => {
    setExpandedSections((previous) => {
      const next = resolveInitialExpandedSections(config.sections, runtime.expandedSections);

      return areBooleanRecordEqual(previous, next) ? previous : next;
    });
  }, [config.sections, runtime.expandedSections]);

  useEffect(() => {
    const previous = externalInputSignatureRef.current;
    const committedChanged = previous.committed !== externalInputSignature.committed;
    const draftChanged = previous.draft !== externalInputSignature.draft;

    if (!committedChanged && !draftChanged) return;

    externalInputSignatureRef.current = externalInputSignature;
    setCommittedBaseline(externalCommittedValues);
    setDraftBaseline(externalDraftValues);

    if (!localDirty && !savingDraft && !committing && !conflict) {
      setValues(externalDraftValues);
    }
  }, [
    externalCommittedValues,
    externalDraftValues,
    externalInputSignature,
    localDirty,
    savingDraft,
    committing,
    conflict,
  ]);

  const permissions = useMemo(
    () => ({
      canEdit: runtime.permissions?.canEdit ?? true,
      canSaveDraft: runtime.permissions?.canSaveDraft ?? config.mode !== 'commit-only',
      canCommit: runtime.permissions?.canCommit ?? config.mode !== 'draft-only',
      canDiscard: runtime.permissions?.canDiscard ?? true,
      canResolveConflict: runtime.permissions?.canResolveConflict ?? true,
    }),
    [runtime.permissions, config.mode],
  );

  const supportsDraft = config.mode !== 'commit-only';
  const supportsCommit = config.mode !== 'draft-only';

  const hasDraftSaveHandler = typeof runtime.onSaveDraft === 'function';
  const hasCommitHandler = typeof runtime.onCommit === 'function';
  const hasResolveConflictHandler = typeof runtime.onResolveConflict === 'function';

  const canEdit = permissions.canEdit && !config.readonly && !config.disabled && !locked;

  const hasBlockingFieldErrors = Object.keys(fieldErrors).length > 0;

  const canTriggerDraftSave = Boolean(
    supportsDraft &&
    hasDraftSaveHandler &&
    permissions.canSaveDraft &&
    canEdit &&
    !conflict &&
    !savingDraft &&
    !committing,
  );

  const canAutosaveDraft = Boolean(canTriggerDraftSave && config.autosave.enabled);

  const canSaveDraftAction = Boolean(canTriggerDraftSave && localDirty);

  const canCommitAction = Boolean(
    supportsCommit &&
    hasCommitHandler &&
    permissions.canCommit &&
    canEdit &&
    !conflict &&
    !savingDraft &&
    !committing &&
    !hasBlockingFieldErrors &&
    (config.mode === 'commit-only' ? localDirty : localDirty || draftDirty),
  );

  const canDiscardAction = Boolean(
    permissions.canDiscard && canEdit && !savingDraft && !committing && (localDirty || draftDirty || Boolean(conflict)),
  );

  const canResolveConflictAction = Boolean(
    conflict && hasResolveConflictHandler && permissions.canResolveConflict && canEdit && !savingDraft && !committing,
  );

  const status = useMemo(
    () =>
      deriveStatus({
        loading,
        locked,
        conflict,
        committing,
        savingDraft,
        statusFlash,
        formError,
        localDirty,
        draftDirty,
        lastSavedAt,
        mode: config.mode,
      }),
    [
      loading,
      locked,
      conflict,
      committing,
      savingDraft,
      statusFlash,
      formError,
      localDirty,
      draftDirty,
      lastSavedAt,
      config.mode,
    ],
  );

  useEffect(() => {
    if (!statusFlash) return undefined;

    const timeoutHandle = window.setTimeout(() => {
      setStatusFlash(undefined);
    }, STATUS_FLASH_MS);

    return () => window.clearTimeout(timeoutHandle);
  }, [statusFlash]);

  useEffect(() => {
    runtime.onStatusChange?.(status);
  }, [runtime.onStatusChange, status]);

  const setValuesAndNotify = useCallback(
    (nextValues: FormValues) => {
      const snapshot = cloneValues(nextValues);
      setValues(snapshot);
      runtime.onValuesChange?.(snapshot);
    },
    [runtime.onValuesChange],
  );

  const applyRuntimeError = useCallback((error: unknown) => {
    const normalized = normalizeRuntimeError(error);

    if (normalized.fieldErrors) {
      setFieldErrors(normalized.fieldErrors);
    }

    if (normalized.conflict) {
      setConflict(normalized.conflict);
    }

    if (normalized.locked === true) {
      setLocked(true);
    }

    if (normalized.lockReason) {
      setLockReason(normalized.lockReason);
    }

    const message = normalized.formError ?? normalized.message;
    if (message) {
      setFormError(message);
    }
  }, []);

  const saveDraft = useCallback(
    async (reason: 'manual' | 'autosave' | 'blur') => {
      if (reason === 'manual') {
        if (!canSaveDraftAction) return;
      } else {
        if (!canAutosaveDraft || !localDirty) return;
        if (reason === 'blur' && !config.autosave.saveOnBlur) return;
      }

      const snapshot = cloneValues(values);
      const token = ++draftRequestTokenRef.current;

      setSavingDraft(true);
      setFormError(undefined);

      try {
        await runtime.onSaveDraft?.({
          values: snapshot,
          reason,
        });

        if (token !== draftRequestTokenRef.current) return;

        setDraftBaseline(snapshot);

        if (config.mode === 'draft-only') {
          setCommittedBaseline(snapshot);
        }

        setLastSavedAt(new Date().toISOString());
        setConflict(undefined);
        setStatusFlash('draft-saved');
      } catch (error) {
        if (token !== draftRequestTokenRef.current) return;
        applyRuntimeError(error);
      } finally {
        if (token === draftRequestTokenRef.current) {
          setSavingDraft(false);
        }
      }
    },
    [
      applyRuntimeError,
      canAutosaveDraft,
      canSaveDraftAction,
      config.autosave.saveOnBlur,
      config.mode,
      localDirty,
      runtime.onSaveDraft,
      values,
    ],
  );

  const commit = useCallback(async () => {
    if (!canCommitAction) return;

    const snapshot = cloneValues(values);

    setCommitting(true);
    setFormError(undefined);

    try {
      await runtime.onCommit?.({
        values: snapshot,
      });

      setCommittedBaseline(snapshot);
      setDraftBaseline(snapshot);
      setFieldErrors({});
      setConflict(undefined);
      setLastSavedAt(new Date().toISOString());
      setStatusFlash('committed');
    } catch (error) {
      applyRuntimeError(error);
    } finally {
      setCommitting(false);
    }
  }, [applyRuntimeError, canCommitAction, runtime.onCommit, values]);

  const discard = useCallback(async () => {
    if (!canDiscardAction) return;

    setFormError(undefined);

    try {
      const result = await runtime.onDiscard?.({
        values: cloneValues(values),
        mode: config.mode,
        committedBaseline: cloneValues(committedBaseline),
        draftBaseline: cloneValues(draftBaseline),
      });

      let nextValues = resolveDiscardValues({
        mode: config.mode,
        committedBaseline,
        draftBaseline,
      });

      if (isRecord(result) && isRecord(result.values)) {
        nextValues = cloneValues(result.values);
      }

      setValuesAndNotify(nextValues);
      setFieldErrors({});
      setFormError(undefined);
      setConflict(undefined);
      setDraftBaseline(nextValues);

      if (config.mode !== 'draft-and-commit') {
        setCommittedBaseline(nextValues);
      }
    } catch (error) {
      applyRuntimeError(error);
    }
  }, [
    applyRuntimeError,
    canDiscardAction,
    committedBaseline,
    config.mode,
    draftBaseline,
    runtime.onDiscard,
    setValuesAndNotify,
    values,
  ]);

  const resolveConflict = useCallback(async () => {
    if (!conflict || !canResolveConflictAction) return;
    if (!runtime.onResolveConflict) return;

    setFormError(undefined);

    try {
      const result = await runtime.onResolveConflict({
        values: cloneValues(values),
        conflict,
      });

      let nextValues = cloneValues(values);

      if (isRecord(result) && isRecord(result.values)) {
        nextValues = cloneValues(result.values);
      }

      setValuesAndNotify(nextValues);
      setDraftBaseline(nextValues);
      setCommittedBaseline(nextValues);
      setFieldErrors({});
      setConflict(undefined);
    } catch (error) {
      applyRuntimeError(error);
    }
  }, [applyRuntimeError, canResolveConflictAction, conflict, runtime.onResolveConflict, setValuesAndNotify, values]);

  const retry = useCallback(async () => {
    if (!runtime.onRetry) return;

    setFormError(undefined);

    try {
      await runtime.onRetry();
    } catch (error) {
      applyRuntimeError(error);
    }
  }, [applyRuntimeError, runtime.onRetry]);

  const handleFieldChange = useCallback(
    (fieldKey: string, value: unknown) => {
      setValues((previousValues) => {
        const nextValues = {
          ...previousValues,
          [fieldKey]: value,
        };

        runtime.onValuesChange?.(nextValues);
        return nextValues;
      });

      setFieldErrors((previousErrors) => {
        if (!previousErrors[fieldKey]) return previousErrors;

        const nextErrors = { ...previousErrors };
        delete nextErrors[fieldKey];
        return nextErrors;
      });

      setFormError(undefined);
    },
    [runtime.onValuesChange],
  );

  const handleFieldBlur = useCallback(() => {
    if (config.autosave.saveOnBlur && canAutosaveDraft && localDirty) {
      void saveDraft('blur');
    }
  }, [canAutosaveDraft, config.autosave.saveOnBlur, localDirty, saveDraft]);

  useEffect(() => {
    if (!canAutosaveDraft || !localDirty) return undefined;

    const timeoutHandle = window.setTimeout(() => {
      void saveDraft('autosave');
    }, config.autosave.debounceMs);

    return () => window.clearTimeout(timeoutHandle);
  }, [canAutosaveDraft, localDirty, config.autosave.debounceMs, saveDraft, values]);

  const sections = useMemo<UseIkaryFormResult['sections']>(
    () =>
      config.sections.map((section) => {
        const sectionPresentation = applyFormStateToSection({
          section,
          fieldErrors,
          readonly: config.readonly || locked,
          disabled: config.disabled || locked,
          dense: config.dense,
        });

        const fieldRuntime = Object.fromEntries(
          sectionPresentation.fields.map((field) => [
            field.key,
            {
              value: values[field.key],
              onValueChange: (nextValue: unknown) => handleFieldChange(field.key, nextValue),
              onBlur: () => handleFieldBlur(),
            },
          ]),
        );

        const defaultExpanded = sectionPresentation.defaultExpanded ?? true;

        return buildFormSectionViewModel({
          presentation: sectionPresentation,
          fieldRuntime,
          actionHandlers: runtime.sectionActionHandlers,
          isAuthorized: runtime.isAuthorized,
          expanded: expandedSections[sectionPresentation.key] ?? defaultExpanded,
          onExpandedChange: (expanded) => {
            setExpandedSections((previous) => ({
              ...previous,
              [sectionPresentation.key]: expanded,
            }));
          },
        });
      }),
    [
      config.sections,
      fieldErrors,
      config.readonly,
      config.disabled,
      config.dense,
      locked,
      values,
      handleFieldChange,
      handleFieldBlur,
      runtime.sectionActionHandlers,
      runtime.isAuthorized,
      expandedSections,
    ],
  );

  const actions = useMemo(
    () => [
      {
        key: 'save-draft' as const,
        label: config.actionLabels.saveDraft,
        intent: 'neutral' as const,
        visible: supportsDraft,
        disabled: !canSaveDraftAction,
        pending: savingDraft,
        onClick: () => {
          void saveDraft('manual');
        },
      },
      {
        key: 'commit' as const,
        label: config.actionLabels.commit,
        intent: 'default' as const,
        visible: supportsCommit,
        disabled: !canCommitAction,
        pending: committing,
        onClick: () => {
          void commit();
        },
      },
      {
        key: 'discard' as const,
        label: config.actionLabels.discard,
        intent: 'neutral' as const,
        visible: true,
        disabled: !canDiscardAction,
        onClick: () => {
          void discard();
        },
      },
      {
        key: 'retry' as const,
        label: config.actionLabels.retry,
        intent: 'neutral' as const,
        visible: status === 'error' && typeof runtime.onRetry === 'function',
        disabled: committing || savingDraft,
        onClick: () => {
          void retry();
        },
      },
      {
        key: 'resolve-conflict' as const,
        label: config.actionLabels.resolveConflict,
        intent: 'danger' as const,
        visible: Boolean(conflict),
        disabled: !canResolveConflictAction,
        onClick: () => {
          void resolveConflict();
        },
      },
    ],
    [
      canCommitAction,
      canDiscardAction,
      canResolveConflictAction,
      canSaveDraftAction,
      commit,
      config.actionLabels.commit,
      config.actionLabels.discard,
      config.actionLabels.resolveConflict,
      config.actionLabels.retry,
      config.actionLabels.saveDraft,
      supportsCommit,
      supportsDraft,
      conflict,
      committing,
      discard,
      resolveConflict,
      retry,
      runtime.onRetry,
      saveDraft,
      savingDraft,
      status,
    ],
  );

  const feedback = useMemo(
    () => ({
      formError,
      conflictMessage: conflict?.message,
      lockReason,
      reviewWarning:
        config.reviewRequired && (localDirty || draftDirty) ? 'Review required before final commit.' : undefined,
    }),
    [config.reviewRequired, conflict, draftDirty, formError, localDirty, lockReason],
  );

  return {
    status,
    lastSavedAt,
    values,
    fieldErrors,
    dirty: {
      localDirty,
      draftDirty,
      remoteStale,
    },
    feedback,
    sections,
    actions,
  };
}

function deriveStatus(input: {
  loading: boolean;
  locked: boolean;
  conflict: FormConflictState | undefined;
  committing: boolean;
  savingDraft: boolean;
  statusFlash: FormStatus | undefined;
  formError: string | undefined;
  localDirty: boolean;
  draftDirty: boolean;
  lastSavedAt: string | undefined;
  mode: 'draft-only' | 'draft-and-commit' | 'commit-only';
}): FormStatus {
  if (input.loading) return 'loading';
  if (input.locked) return 'locked';
  if (input.conflict) return 'conflict';
  if (input.committing) return 'committing';
  if (input.savingDraft) return 'saving-draft';
  if (input.statusFlash === 'committed') return 'committed';
  if (input.statusFlash === 'draft-saved' && input.mode !== 'commit-only') {
    return 'draft-saved';
  }
  if (input.formError) return 'error';
  if (input.localDirty) return 'editing';

  if (input.mode === 'draft-and-commit' && input.draftDirty) {
    return 'needs-review';
  }

  if (input.mode !== 'commit-only' && !input.localDirty && input.lastSavedAt) {
    return 'draft-saved';
  }

  if (!input.localDirty && !input.draftDirty) {
    return 'ready';
  }

  return 'idle';
}

function applyFormStateToSection(input: {
  section: FormSectionPresentation;
  fieldErrors: FormFieldErrors;
  readonly: boolean;
  disabled: boolean;
  dense: boolean;
}): FormSectionPresentation {
  return {
    ...input.section,
    readonly: input.readonly ? true : input.section.readonly,
    disabled: input.disabled ? true : input.section.disabled,
    dense: input.dense ? true : input.section.dense,
    fields: input.section.fields.map((field) => applyFieldErrorToField(field, input.fieldErrors[field.key])),
  };
}

function applyFieldErrorToField(field: FormFieldPresentation, errorMessage: string | undefined): FormFieldPresentation {
  if (!errorMessage) return field;

  return {
    ...field,
    message: {
      tone: 'error',
      text: errorMessage,
    },
  };
}

function resolveDiscardValues(input: {
  mode: 'draft-only' | 'draft-and-commit' | 'commit-only';
  committedBaseline: FormValues;
  draftBaseline: FormValues;
}): FormValues {
  if (input.mode === 'commit-only') {
    return cloneValues(input.committedBaseline);
  }

  return cloneValues(input.draftBaseline);
}

function resolveInitialExpandedSections(
  sections: FormSectionPresentation[],
  expandedSections: Record<string, boolean> | undefined,
): Record<string, boolean> {
  const resolvedEntries = sections.map((section) => [
    section.key,
    expandedSections?.[section.key] ?? section.defaultExpanded ?? true,
  ]);

  return Object.fromEntries(resolvedEntries);
}

function resolveDraftInputValues(runtime: UseIkaryFormInput['runtime']): FormValues {
  return cloneValues(runtime.draftValues ?? runtime.initialValues ?? {});
}

function resolveCommittedInputValues(
  runtime: UseIkaryFormInput['runtime'],
  mode: UseIkaryFormInput['config']['mode'],
): FormValues {
  if (mode === 'draft-only') {
    return resolveDraftInputValues(runtime);
  }

  return cloneValues(runtime.initialValues ?? {});
}

function normalizeRuntimeError(error: unknown): FormRuntimeError {
  if (isRecord(error)) {
    return {
      message: toOptionalString(error.message),
      formError: toOptionalString(error.formError),
      fieldErrors: normalizeFieldErrors(error.fieldErrors),
      conflict: normalizeConflict(error.conflict),
      lockReason: toOptionalString(error.lockReason),
      locked: error.locked === true,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: 'Form operation failed',
  };
}

function normalizeFieldErrors(value: unknown): FormFieldErrors | undefined {
  if (!isRecord(value)) return undefined;

  const entries = Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string');

  return Object.fromEntries(entries);
}

function normalizeConflict(value: unknown): FormConflictState | undefined {
  if (typeof value === 'string' && value.trim().length > 0) {
    return { message: value };
  }

  if (!isRecord(value)) return undefined;

  const message = toOptionalString(value.message);
  if (!message) return undefined;

  return {
    message,
  };
}

function toOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function cloneValues(values: FormValues): FormValues {
  return JSON.parse(JSON.stringify(values)) as FormValues;
}

function areValuesEqual(a: FormValues, b: FormValues): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function serializeValues(value: FormValues): string {
  return JSON.stringify(value);
}

function areBooleanRecordEqual(a: Record<string, boolean>, b: Record<string, boolean>): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  return keysA.every((key) => a[key] === b[key]);
}
