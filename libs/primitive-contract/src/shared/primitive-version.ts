/**
 * Minimal semver utilities for primitive version resolution.
 * Supports exact versions ('1.0.0') and x-range patterns ('1.x', '1.x.x', '1').
 */

/** Parse a semver string into [major, minor, patch]. Returns null if invalid. */
export function parseSemver(version: string): [number, number, number] | null {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) return null;
  return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
}

/**
 * Check if a registered version satisfies a requested version range.
 * Supported range forms:
 *  - '1.0.0' → exact match
 *  - '1'     → major only (1.x.x)
 *  - '1.2'   → major.minor (1.2.x)
 *  - '1.x'   → same as '1'
 *  - '1.2.x' → same as '1.2'
 */
export function versionSatisfies(registered: string, requested: string): boolean {
  if (requested === 'latest' || requested === registered) return true;

  const parsed = parseSemver(registered);
  if (!parsed) return false;
  const [rMaj, rMin, rPat] = parsed;

  const clean = requested.replace(/\.x/gi, '').replace(/x/gi, '');
  const parts = clean.split('.').filter(Boolean);

  if (parts.length === 1) {
    return rMaj === parseInt(parts[0], 10);
  }
  if (parts.length === 2) {
    return rMaj === parseInt(parts[0], 10) && rMin === parseInt(parts[1], 10);
  }
  if (parts.length === 3) {
    return (
      rMaj === parseInt(parts[0], 10) &&
      rMin === parseInt(parts[1], 10) &&
      rPat === parseInt(parts[2], 10)
    );
  }
  return false;
}

/**
 * Given a list of registered version strings and a requested range,
 * return the highest-matching version or null if none match.
 */
export function resolveVersion(versions: string[], requested: string): string | null {
  if (requested === 'latest') return null; // caller handles 'latest' pointer

  const matching = versions.filter((v) => versionSatisfies(v, requested));
  if (matching.length === 0) return null;

  return matching.sort((a, b) => {
    const pa = parseSemver(a);
    const pb = parseSemver(b);
    if (!pa || !pb) return 0;
    for (let i = 0; i < 3; i++) {
      if (pa[i] !== pb[i]) return pb[i] - pa[i]; // descending
    }
    return 0;
  })[0];
}
