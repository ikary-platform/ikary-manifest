import type { FieldBinding, ValueBinding } from '../types/BindingTypes';

export function resolveValue(record: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc: unknown, key) => {
    if (acc != null && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, record as unknown);
}

export function resolveBinding(record: Record<string, unknown>, binding: unknown): unknown {
  if (binding == null) return undefined;
  if (typeof binding === 'object') {
    if ('field' in (binding as object)) {
      return resolveValue(record, (binding as FieldBinding).field);
    }
    if ('value' in (binding as object)) {
      return (binding as ValueBinding).value;
    }
  }
  return binding;
}
