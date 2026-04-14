import { Injectable } from '@nestjs/common';
import { parse as parsePartialJson, Allow } from 'partial-json';
import { parseManifest } from '@ikary/cell-contract';

export interface AssemblerState {
  buffer: string;
  lastValidManifest: unknown | null;
  lastPartial: unknown | null;
}

@Injectable()
export class PartialManifestAssembler {
  create(): AssemblerState {
    return { buffer: '', lastValidManifest: null, lastPartial: null };
  }

  /**
   * Append a streamed chunk and attempt to produce the freshest parsed view.
   *
   * Returns:
   *   - `valid`   - manifest that parsed AND validated against CellManifestV1.
   *   - `partial` - best-effort tolerant parse (may be incomplete).
   *   - `changed` - whether the snapshot differs from the previous chunk.
   *
   * Models often emit garbage around the JSON body (markdown fences, prose,
   * even a duplicate JSON block). We extract the first balanced `{...}` from
   * the buffer (string-literal aware) and parse only that.
   */
  ingest(state: AssemblerState, chunk: string): { valid: unknown | null; partial: unknown | null; changed: boolean } {
    state.buffer += chunk;
    const candidate = extractFirstObjectCandidate(state.buffer);

    let partial: unknown | null = state.lastPartial;
    if (candidate.text) {
      try {
        partial = parsePartialJson(candidate.text, Allow.ALL);
      } catch {
        /* keep last */
      }
    }
    const partialChanged = stableStringify(partial) !== stableStringify(state.lastPartial);
    state.lastPartial = partial;

    let valid = state.lastValidManifest;
    if (candidate.balanced && candidate.text) {
      try {
        const json = JSON.parse(candidate.text);
        const result = parseManifest(json);
        if (result.valid && result.manifest) valid = result.manifest;
      } catch {
        /* keep last */
      }
    }
    const validChanged = stableStringify(valid) !== stableStringify(state.lastValidManifest);
    state.lastValidManifest = valid;

    return { valid, partial, changed: partialChanged || validChanged };
  }

  finalize(state: AssemblerState): { valid: unknown | null; raw: string } {
    return { valid: state.lastValidManifest, raw: state.buffer };
  }
}

/**
 * Walk the text and return the first top-level `{...}` substring.
 *
 * - `balanced: true` means we found the matching `}` (safe for JSON.parse).
 * - `balanced: false` means we found `{` but the object is still streaming.
 * - `text: ''` means no `{` has appeared yet.
 */
function extractFirstObjectCandidate(text: string): { text: string; balanced: boolean } {
  const start = text.indexOf('{');
  if (start === -1) return { text: '', balanced: false };

  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i]!;
    if (inString) {
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (ch === '"') { inString = false; continue; }
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return { text: text.slice(start, i + 1), balanced: true };
      }
    }
  }
  return { text: text.slice(start), balanced: false };
}

function stableStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
}
