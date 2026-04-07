import type { BaseSyntheticEvent } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { EntityDefinition } from '@ikary-manifest/contract';
import type { ToastAPI } from '../../ui-components';
import type { DetailPageMode } from './use-detail-page-mode';
import type { CellDataStore } from '../../store/cell-data-store';

interface UseOverviewTabFormOptions {
  entity: EntityDefinition;
  record: Record<string, unknown>;
  recordId: string;
  mode: DetailPageMode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  dataStore: CellDataStore;
  dataMode: 'mock' | 'live';
  toast: ToastAPI;
}

export function useOverviewTabForm({
  entity,
  record,
  recordId,
  mode,
  form,
  dataStore,
  dataMode,
  toast,
}: UseOverviewTabFormOptions) {
  const submitForm: (e?: BaseSyntheticEvent) => Promise<void> = form.handleSubmit(async (data: Record<string, unknown>) => {
    mode.beginSave();
    try {
      const version = Number(record['_version'] ?? record['version'] ?? 1);
      const patch = dataMode === 'live' ? { ...data, _version: version, expectedVersion: version } : data;
      await dataStore.update(entity.key, recordId, patch);
      mode.completeSave();
      toast.success(`${entity.name} updated`);
    } catch (err: any) {
      const statusCode = err?.statusCode ?? err?.status;
      if (statusCode === 409) {
        mode.failSave('This record was modified by another user. Refresh to see the latest version.');
      } else {
        mode.failSave(err?.message);
      }
    }
  });

  return {
    register: form.register,
    submitForm,
    errors: form.formState.errors,
    isDirty: form.formState.isDirty,
  };
}
