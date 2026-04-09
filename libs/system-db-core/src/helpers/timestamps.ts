export function toDate(value: string | Date | null | undefined): Date | null {
  if (value === null || value === undefined) {
    return null;
  }
  return value instanceof Date ? value : new Date(value);
}
