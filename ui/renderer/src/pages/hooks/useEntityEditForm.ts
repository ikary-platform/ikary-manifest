import type { BaseSyntheticEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import type { NavigateFunction } from 'react-router-dom';
import type { CellManifestV1 } from '@ikary/contract';
import { buildEntityDetailPath, buildEntityListPath } from '@ikary/engine';
import type { CellDataStore } from '../../store/cell-data-store';

interface UseEntityEditFormOptions {
  manifest: CellManifestV1;
  entityKey: string;
  recordId: string;
  defaultValues: Record<string, any>;
  zodSchema: z.ZodObject<any>;
  dataStore: CellDataStore;
  navigate: NavigateFunction;
}

export function useEntityEditForm({
  manifest,
  entityKey,
  recordId,
  defaultValues,
  zodSchema,
  dataStore,
  navigate,
}: UseEntityEditFormOptions) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues,
  });

  const detailPath = buildEntityDetailPath(manifest, entityKey, recordId);
  const listPath = buildEntityListPath(manifest, entityKey);

  const submitForm: (e?: BaseSyntheticEvent) => Promise<void> = handleSubmit(async (data: Record<string, unknown>) => {
    await dataStore.update(entityKey, recordId, data);
    if (detailPath) {
      navigate(detailPath);
      return;
    }
    if (listPath) {
      navigate(listPath);
    }
  });

  return {
    register,
    submitForm,
    errors,
    isSubmitting,
    isDirty,
    detailPath,
    listPath,
  };
}
