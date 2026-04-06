import { useCallback, useMemo } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ResolvedCreateField } from '@ikary-manifest/engine';
import { buildCreateZodSchema } from '../../form/schema/build-create-zod-schema';
import { useDetailPageMode, type DetailPageMode } from './use-detail-page-mode';

export interface DetailPageEditContext {
  mode: DetailPageMode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  onEnterEdit: () => void;
}

/**
 * Combines useDetailPageMode with a react-hook-form instance.
 *
 * onEnterEdit must be called from the Edit button click handler. It snapshots
 * the current record values at click time and resets the form imperatively —
 * no useEffect, no stale-closure risk from background React Query refetches.
 */
export function useDetailPageEdit(
  record: Record<string, unknown>,
  editFields: ResolvedCreateField[],
): DetailPageEditContext {
  const mode = useDetailPageMode();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const zodSchema = useMemo(() => buildCreateZodSchema(editFields as any), [editFields]);

  const form = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: {},
  });

  const onEnterEdit = useCallback(() => {
    const values = Object.fromEntries(
      editFields.map((f) => [f.key, record[f.key] ?? (f.type === 'boolean' ? false : '')]),
    );
    form.reset(values);
    mode.enterEdit();
  }, [record, editFields, form, mode]);

  return { mode, form, onEnterEdit };
}
