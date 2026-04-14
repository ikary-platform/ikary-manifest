import { useState, useEffect } from 'react';

/**
 * Fetches a JSON Schema from the given URL once on mount.
 * Returns null while loading or if the request fails — callers degrade gracefully.
 */
export function useSchemaFetch(url: string | undefined): object | null {
  const [schema, setSchema] = useState<object | null>(null);

  useEffect(() => {
    // Clear stale schema immediately when url is removed or changed
    setSchema(null);

    if (!url) return;
    let cancelled = false;

    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: unknown) => {
        if (!cancelled && data && typeof data === 'object') {
          setSchema(data as object);
        }
      })
      .catch(() => {
        // Silently degrade — Monaco still works as a plain JSON editor without a schema
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return schema;
}
