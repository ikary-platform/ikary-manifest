/**
 * Derive a filesystem-safe slug from a manifest by reading `metadata.key`.
 * Returns `null` when the manifest shape isn't recognised so callers can
 * fall back to a default name.
 */
export function inferSlug(manifest: unknown): string | null {
  if (!manifest || typeof manifest !== 'object') return null;
  const meta = (manifest as { metadata?: { key?: unknown } }).metadata;
  if (meta && typeof meta.key === 'string' && meta.key.length > 0) return meta.key;
  return null;
}
