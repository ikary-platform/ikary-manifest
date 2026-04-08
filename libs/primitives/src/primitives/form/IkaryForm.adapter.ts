import type { IkaryFormPresentation } from '@ikary/presentation';
import type {
  IkaryFormActionLabels,
  IkaryFormAutosaveConfig,
  IkaryFormMode,
  IkaryFormPermissionState,
  IkaryFormRuntimeInput,
  IkaryFormViewProps,
} from './IkaryForm.types';

export type BuildIkaryFormViewModelInput = {
  presentation: IkaryFormPresentation;
} & IkaryFormRuntimeInput;

export function buildIkaryFormViewModel(input: BuildIkaryFormViewModelInput): IkaryFormViewProps {
  const mode = input.presentation.mode ?? 'draft-and-commit';

  return {
    config: {
      key: input.presentation.key,
      title: input.presentation.title,
      description: input.presentation.description,

      mode,
      autosave: resolveAutosave(mode, input.presentation.autosave),
      actionLabels: resolveActionLabels(mode, input.presentation.actionLabels),

      sections: input.presentation.sections,

      reviewRequired: input.presentation.reviewRequired ?? false,
      readonly: input.presentation.readonly ?? false,
      disabled: input.presentation.disabled ?? false,
      dense: input.presentation.dense ?? false,
      testId: input.presentation.testId,
    },

    runtime: {
      initialValues: input.initialValues ?? {},
      draftValues: input.draftValues,

      loading: input.loading ?? false,

      fieldErrors: input.fieldErrors ?? {},
      formError: input.formError,

      locked: input.locked ?? false,
      lockReason: input.lockReason,
      conflict: input.conflict,

      permissions: resolvePermissions(mode, input.permissions),
      expandedSections: input.expandedSections,

      lastSavedAt: input.lastSavedAt,

      onSaveDraft: input.onSaveDraft,
      onCommit: input.onCommit,
      onDiscard: input.onDiscard,
      onResolveConflict: input.onResolveConflict,
      onRetry: input.onRetry,

      onValuesChange: input.onValuesChange,
      onStatusChange: input.onStatusChange,

      sectionActionHandlers: input.sectionActionHandlers,
      isAuthorized: input.isAuthorized,
    },
  };
}

function resolveAutosave(
  mode: IkaryFormMode,
  autosave:
    | {
        enabled?: boolean;
        debounceMs?: number;
        saveOnBlur?: boolean;
      }
    | undefined,
): IkaryFormAutosaveConfig {
  if (mode === 'commit-only') {
    return {
      enabled: false,
      debounceMs: 800,
      saveOnBlur: false,
    };
  }

  return {
    enabled: autosave?.enabled ?? true,
    debounceMs: autosave?.debounceMs ?? 800,
    saveOnBlur: autosave?.saveOnBlur ?? false,
  };
}

function resolveActionLabels(
  mode: IkaryFormMode,
  labels:
    | {
        saveDraft?: string;
        commit?: string;
        discard?: string;
        retry?: string;
        resolveConflict?: string;
      }
    | undefined,
): IkaryFormActionLabels {
  return {
    saveDraft: labels?.saveDraft ?? (mode === 'draft-only' ? 'Save' : 'Save Draft'),
    commit: labels?.commit ?? 'Commit',
    discard: labels?.discard ?? 'Discard',
    retry: labels?.retry ?? 'Retry',
    resolveConflict: labels?.resolveConflict ?? 'Resolve Conflict',
  };
}

function resolvePermissions(
  mode: IkaryFormMode,
  permissions: Partial<IkaryFormPermissionState> | undefined,
): IkaryFormPermissionState {
  return {
    canEdit: permissions?.canEdit ?? true,
    canSaveDraft: permissions?.canSaveDraft ?? mode !== 'commit-only',
    canCommit: permissions?.canCommit ?? mode !== 'draft-only',
    canDiscard: permissions?.canDiscard ?? true,
    canResolveConflict: permissions?.canResolveConflict ?? true,
  };
}

// Backward-compatible aliases for existing imports.
export type BuildFormViewModelInput = BuildIkaryFormViewModelInput;
export const buildFormViewModel = buildIkaryFormViewModel;
