/**
 * Traverses a dotted path (e.g. "company.id") in a plain record and returns
 * the string value at that path, or undefined if any segment is missing or
 * the terminal value is not a string.
 */
export function resolveIdFrom(record: Record<string, unknown>, path: string): string | undefined {
  const val = path
    .split('.')
    .reduce<unknown>(
      (acc, key) => (acc != null && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined),
      record,
    );
  return typeof val === 'string' ? val : undefined;
}
