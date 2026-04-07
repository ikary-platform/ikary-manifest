import { useMemo, type BaseSyntheticEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { buildEntityDetailPath, buildEntityListPath } from '@ikary-manifest/engine';
import { useUIComponents } from '../../../UIComponentsProvider';
import { buildCreateZodSchema } from '../../../form/schema/build-create-zod-schema';
import { useCellManifest, useCellRuntime } from '../../../context/cell-runtime-context';
import type { ManifestRuntimeEntity } from '../../../manifest/selectors';

interface UseEntityCreateSheetFormOptions {
  entity: ManifestRuntimeEntity;
  onOpenChange: (open: boolean) => void;
}

export function useEntityCreateSheetForm({ entity, onOpenChange }: UseEntityCreateSheetFormOptions) {
  const { dataStore } = useCellRuntime();
  const manifest = useCellManifest();
  const navigate = useNavigate();
  const { toast } = useUIComponents();

  const createFields = entity.createFields;

  const defaultValues = useMemo(
    () => Object.fromEntries(createFields.map((f) => [f.key, f.type === 'boolean' ? false : ''])),
    [createFields],
  );

  const zodSchema = useMemo(() => buildCreateZodSchema(createFields), [createFields]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues,
  });

  const submitForm: (e?: BaseSyntheticEvent) => Promise<void> = handleSubmit(async (data: Record<string, unknown>) => {
    try {
      const created = await dataStore.create(entity.key, data);
      const id = String(created['id']);

      toast.success(`${entity.name} created`);
      onOpenChange(false);

      const detailPath = buildEntityDetailPath(manifest, entity.key, id);
      if (detailPath) {
        navigate(detailPath);
        return;
      }

      const listPath = buildEntityListPath(manifest, entity.key);
      if (listPath) {
        navigate(listPath);
      }
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to create record');
    }
  });

  return { createFields, register, submitForm, errors, isSubmitting };
}
