import { useCallback } from 'react';
import type {
  IkaryFormRuntimeInput,
  IkaryFormCommitHandler,
  IkaryFormSaveDraftHandler,
  IkaryFormDiscardHandler,
  IkaryFormRetryHandler,
} from '../IkaryForm.types';

export interface UseFormRuntimeOptions {
  /**
   * Explicit allow-list of field keys the form declares.
   * `buildRuntime` picks only these keys from the raw record —
   * system/infrastructure columns (id, version, tenant_id, …) are
   * never in this list and are therefore never passed to the form.
   * Derived by the caller from the presentation: `sections.flatMap(s => s.fields.map(f => f.key))`
   */
  fieldKeys?: string[];
  onCommit?: IkaryFormCommitHandler;
  onSaveDraft?: IkaryFormSaveDraftHandler;
  onDiscard?: IkaryFormDiscardHandler;
  onRetry?: IkaryFormRetryHandler;
}

export interface UseFormRuntimeResult {
  buildRuntime: (
    record: Record<string, unknown> | null,
    isLoading: boolean,
    errorMessage?: string,
    fieldErrors?: Record<string, string>,
  ) => IkaryFormRuntimeInput;
}

export function useFormRuntime(opts: UseFormRuntimeOptions = {}): UseFormRuntimeResult {
  const buildRuntime = useCallback(
    (
      record: Record<string, unknown> | null,
      isLoading: boolean,
      errorMessage?: string,
      fieldErrors?: Record<string, string>,
    ): IkaryFormRuntimeInput => {
      const initialValues =
        record && opts.fieldKeys
          ? Object.fromEntries(opts.fieldKeys.filter((key) => key in record).map((key) => [key, record[key]]))
          : (record ?? undefined);

      return {
        initialValues,
        loading: isLoading,
        formError: errorMessage,
        fieldErrors,
        onCommit: opts.onCommit,
        onSaveDraft: opts.onSaveDraft,
        onDiscard: opts.onDiscard,
        onRetry: opts.onRetry,
      };
    },
    [opts.fieldKeys, opts.onCommit, opts.onSaveDraft, opts.onDiscard, opts.onRetry],
  );

  return { buildRuntime };
}
