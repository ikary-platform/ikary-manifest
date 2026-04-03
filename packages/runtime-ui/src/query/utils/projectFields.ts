export function projectFields<T extends Record<string, unknown>>(record: T, fields?: string[]): T {
  if (!fields || fields.length === 0) return record;
  return Object.fromEntries(Object.entries(record).filter(([k]) => fields.includes(k))) as T;
}
