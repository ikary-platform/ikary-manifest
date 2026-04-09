import type { IkaryFormPresentation, FormSectionPresentation } from '@ikary/presentation';
import type { FormSectionViewProps } from '../form-section/FormSection.types';

export type IkaryFormValues = Record<string, unknown>;
export type IkaryFormFieldErrors = Record<string, string>;

export type IkaryFormStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'editing'
  | 'saving-draft'
  | 'draft-saved'
  | 'committing'
  | 'committed'
  | 'needs-review'
  | 'error'
  | 'conflict'
  | 'locked';

export type IkaryFormMode = NonNullable<IkaryFormPresentation['mode']>;
export type IkaryFormActionKey = 'save-draft' | 'commit' | 'discard' | 'retry' | 'resolve-conflict';

export type IkaryFormActionIntent = 'default' | 'neutral' | 'danger';

export type IkaryFormActionView = {
  key: IkaryFormActionKey;
  label: string;
  intent?: IkaryFormActionIntent;
  visible: boolean;
  disabled: boolean;
  pending?: boolean;
  onClick?: () => void;
};

export type IkaryFormAutosaveConfig = {
  enabled: boolean;
  debounceMs: number;
  saveOnBlur: boolean;
};

export type IkaryFormActionLabels = {
  saveDraft: string;
  commit: string;
  discard: string;
  retry: string;
  resolveConflict: string;
};

export type IkaryFormPermissionState = {
  canEdit: boolean;
  canSaveDraft: boolean;
  canCommit: boolean;
  canDiscard: boolean;
  canResolveConflict: boolean;
};

export type IkaryFormConflictState = {
  message: string;
};

export type IkaryFormRuntimeError = {
  message?: string;
  fieldErrors?: IkaryFormFieldErrors;
  formError?: string;
  conflict?: IkaryFormConflictState;
  lockReason?: string;
  locked?: boolean;
};

export type IkaryFormSaveDraftHandler = (input: {
  values: IkaryFormValues;
  reason: 'manual' | 'autosave' | 'blur';
}) => Promise<void> | void;

export type IkaryFormCommitHandler = (input: { values: IkaryFormValues }) => Promise<void> | void;

export type IkaryFormDiscardHandler = (input: {
  values: IkaryFormValues;
  mode: IkaryFormMode;
  committedBaseline: IkaryFormValues;
  draftBaseline: IkaryFormValues;
}) => Promise<{ values?: IkaryFormValues } | void> | { values?: IkaryFormValues } | void;

export type IkaryFormResolveConflictHandler = (input: {
  values: IkaryFormValues;
  conflict: IkaryFormConflictState;
}) => Promise<{ values?: IkaryFormValues } | void> | { values?: IkaryFormValues } | void;

export type IkaryFormRetryHandler = () => Promise<void> | void;

export type IkaryFormRuntimeInput = {
  initialValues?: IkaryFormValues;
  draftValues?: IkaryFormValues;

  loading?: boolean;

  fieldErrors?: IkaryFormFieldErrors;
  formError?: string;

  locked?: boolean;
  lockReason?: string;
  conflict?: IkaryFormConflictState;

  permissions?: Partial<IkaryFormPermissionState>;
  expandedSections?: Record<string, boolean>;

  lastSavedAt?: string;

  onSaveDraft?: IkaryFormSaveDraftHandler;
  onCommit?: IkaryFormCommitHandler;
  onDiscard?: IkaryFormDiscardHandler;
  onResolveConflict?: IkaryFormResolveConflictHandler;
  onRetry?: IkaryFormRetryHandler;

  onValuesChange?: (values: IkaryFormValues) => void;
  onStatusChange?: (status: IkaryFormStatus) => void;

  sectionActionHandlers?: Record<string, () => void>;
  isAuthorized?: (actionKey: string) => boolean;
};

export type IkaryFormResolvedConfig = {
  key: string;
  title: string;
  description?: string;

  mode: IkaryFormMode;
  autosave: IkaryFormAutosaveConfig;
  actionLabels: IkaryFormActionLabels;

  sections: FormSectionPresentation[];

  reviewRequired: boolean;
  readonly: boolean;
  disabled: boolean;
  dense: boolean;
  testId?: string;
};

export type IkaryFormViewProps = {
  config: IkaryFormResolvedConfig;
  runtime: IkaryFormRuntimeInput;
};

export type IkaryFormFeedbackState = {
  formError?: string;
  conflictMessage?: string;
  lockReason?: string;
  reviewWarning?: string;
};

export type IkaryFormDirtyState = {
  localDirty: boolean;
  draftDirty: boolean;
  remoteStale: boolean;
};

export type UseIkaryFormInput = IkaryFormViewProps;

export type UseIkaryFormResult = {
  status: IkaryFormStatus;
  lastSavedAt?: string;

  values: IkaryFormValues;
  fieldErrors: IkaryFormFieldErrors;
  dirty: IkaryFormDirtyState;
  feedback: IkaryFormFeedbackState;

  sections: FormSectionViewProps[];
  actions: IkaryFormActionView[];
};

// Backward-compatible aliases for existing imports.
export type FormValues = IkaryFormValues;
export type FormFieldErrors = IkaryFormFieldErrors;
export type FormStatus = IkaryFormStatus;
export type FormMode = IkaryFormMode;
export type FormActionKey = IkaryFormActionKey;
export type FormActionIntent = IkaryFormActionIntent;
export type FormActionView = IkaryFormActionView;
export type FormAutosaveConfig = IkaryFormAutosaveConfig;
export type FormActionLabels = IkaryFormActionLabels;
export type FormPermissionState = IkaryFormPermissionState;
export type FormConflictState = IkaryFormConflictState;
export type FormRuntimeError = IkaryFormRuntimeError;
export type FormSaveDraftHandler = IkaryFormSaveDraftHandler;
export type FormCommitHandler = IkaryFormCommitHandler;
export type FormDiscardHandler = IkaryFormDiscardHandler;
export type FormResolveConflictHandler = IkaryFormResolveConflictHandler;
export type FormRetryHandler = IkaryFormRetryHandler;
export type FormRuntimeInput = IkaryFormRuntimeInput;
export type FormResolvedConfig = IkaryFormResolvedConfig;
export type FormViewProps = IkaryFormViewProps;
export type FormFeedbackState = IkaryFormFeedbackState;
export type FormDirtyState = IkaryFormDirtyState;
