/** Converts a kebab-case or snake_case primitive key to a display label. */
export function toLabel(key: string): string {
  return key
    .split(/[-_]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}
