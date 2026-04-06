import { useState, useRef, useMemo, useCallback } from 'react';
import type { EntityDefinition, FieldDefinition, RelationCreatePolicy } from '@ikary-manifest/contract';
import type { FormFieldPresentation } from '@ikary-manifest/presentation';
import type { EntityRouteParams } from '@ikary-manifest/contract';
import type { FormFieldViewProps, RelationFieldOption, RelationFieldRuntime } from '@ikary-manifest/primitives';
import { buildFormFieldViewModel } from '@ikary-manifest/primitives';
import { useDataHooks } from '../data-hooks';
import { useEntityRegistryOptional } from '../EntityRegistryContext';

export interface UseRelationRuntimeOptions {
  entityKey: string;
  relationKey: string;
  createPolicy: RelationCreatePolicy;
  targetEntityKey: string;
  displayField?: string;
  routeParams: Omit<EntityRouteParams, 'entityKey'>;
  value: unknown;
  onValueChange: (v: unknown) => void;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  dense?: boolean;
}

function fieldToPresentation(field: FieldDefinition): FormFieldPresentation | null {
  if (field.type === 'boolean') {
    return {
      type: 'form-field',
      key: field.key,
      variant: 'checkbox',
      label: field.name ?? field.key,
    } as FormFieldPresentation;
  }

  const control = (() => {
    switch (field.type) {
      case 'number':
        return 'number' as const;
      case 'text':
        return 'textarea' as const;
      case 'date':
      case 'datetime':
        return 'date' as const;
      case 'enum':
        return 'select' as const;
      default:
        return 'text' as const;
    }
  })();

  return {
    type: 'form-field',
    key: field.key,
    variant: 'standard',
    control,
    label: field.name ?? field.key,
    required:
      field.validation?.fieldRules?.some((rule: Record<string, unknown>) => rule['type'] === 'required') ?? false,
    ...(control === 'select' && field.enumValues && (field.enumValues as string[]).length > 0
      ? {
          options: (field.enumValues as string[]).map((value) => ({
            key: value,
            label: value,
            value,
          })),
        }
      : {}),
  } as FormFieldPresentation;
}

function getCreateFields(entity: EntityDefinition): FieldDefinition[] {
  return (entity.fields as FieldDefinition[])
    .filter((field) => {
      if ((field as Record<string, unknown>).system) return false;
      if (field.create?.visible === false) return false;
      if (field.create?.visible === undefined && field.form?.visible === false) return false;
      return true;
    })
    .slice()
    .sort((left, right) => (left.create?.order ?? 0) - (right.create?.order ?? 0));
}

export function useRelationRuntime(opts: UseRelationRuntimeOptions): RelationFieldRuntime {
  const { useCellEntityList, useCellEntityGetOne } = useDataHooks();
  const registry = useEntityRegistryOptional();
  const targetEntity = registry?.getEntity(opts.targetEntityKey) ?? null;

  const listParams: EntityRouteParams = {
    ...opts.routeParams,
    entityKey: opts.targetEntityKey,
  };

  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [createValues, setCreateValues] = useState<Record<string, unknown>>({});
  const [activeTab, setActiveTab] = useState<'create' | 'attach'>('attach');

  const [listResult, isSearching] = useCellEntityList(listParams, {
    search: debouncedSearch || undefined,
    pageSize: 20,
  });

  const attachedId = typeof opts.value === 'string' ? opts.value : null;
  const [selectedRecord] = useCellEntityGetOne(listParams, attachedId);

  const displayField = useMemo(() => {
    if (opts.displayField) return opts.displayField;
    return (targetEntity?.fields as FieldDefinition[] | undefined)?.find((field) => field.type === 'string')?.key;
  }, [opts.displayField, targetEntity]);

  const searchResults = useMemo(
    (): RelationFieldOption[] =>
      listResult.data.map((row) => ({
        id: String(row['id'] ?? ''),
        label: displayField ? String(row[displayField] ?? row['id'] ?? '') : String(row['id'] ?? ''),
      })),
    [displayField, listResult.data],
  );

  const selectedOption = useMemo((): RelationFieldOption | null => {
    if (!attachedId) return null;
    const data = selectedRecord?.data as Record<string, unknown> | undefined;
    return {
      id: attachedId,
      label: data && displayField ? String(data[displayField] ?? attachedId) : attachedId,
    };
  }, [attachedId, displayField, selectedRecord]);

  const handleCreateValueChange = useCallback(
    (key: string, value: unknown) => {
      setCreateValues((current) => {
        const next = { ...current, [key]: value };
        opts.onValueChange({ $create: next });
        return next;
      });
    },
    [opts.onValueChange],
  );

  const createFields = useMemo((): FormFieldViewProps[] => {
    if (!targetEntity) return [];
    return getCreateFields(targetEntity)
      .map((field) => fieldToPresentation(field))
      .filter((presentation): presentation is FormFieldPresentation => presentation !== null)
      .map((presentation) =>
        buildFormFieldViewModel({
          presentation,
          value: createValues[presentation.key],
          onValueChange: (value) => handleCreateValueChange(presentation.key, value),
        }),
      );
  }, [createValues, handleCreateValueChange, targetEntity]);

  const onSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(value), 350);
  }, []);

  const onSelect = useCallback(
    (option: RelationFieldOption | null) => {
      opts.onValueChange(option?.id ?? null);
    },
    [opts.onValueChange],
  );

  const onCreateValueChange = useCallback(
    (key: string, value: unknown) => {
      handleCreateValueChange(key, value);
    },
    [handleCreateValueChange],
  );

  const onTabChange = useCallback(
    (tab: 'create' | 'attach') => {
      setActiveTab(tab);
      opts.onValueChange(null);
      if (tab === 'create') {
        setCreateValues({});
        return;
      }
      setSearchValue('');
      setDebouncedSearch('');
    },
    [opts.onValueChange],
  );

  return {
    searchResults,
    isSearching,
    selectedOption,
    searchValue,
    onSearchChange,
    onSelect,
    createFields,
    createValues,
    onCreateValueChange,
    activeTab,
    onTabChange,
    value: opts.value,
    onValueChange: opts.onValueChange,
  };
}
