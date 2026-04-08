import type { PatchOperation, StudioCurrentArtifactSet } from './contracts';

interface PatchRoot {
  manifest: unknown;
  entity_schema: unknown;
  layout: unknown;
  action: unknown;
  permission: unknown;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function decodePointerToken(token: string): string {
  return token.replace(/~1/g, '/').replace(/~0/g, '~');
}

function splitPointer(path: string): string[] {
  if (!path.startsWith('/')) {
    throw new Error(`Invalid JSON pointer: ${path}`);
  }
  return path.split('/').slice(1).map(decodePointerToken);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function getParent(root: unknown, tokens: string[], createMissing: boolean): { parent: unknown; key: string } {
  if (tokens.length === 0) {
    throw new Error('Patch path cannot target the whole document root directly.');
  }

  let current = root;
  for (let i = 0; i < tokens.length - 1; i += 1) {
    const token = tokens[i]!;

    if (Array.isArray(current)) {
      const index = token === '-' ? current.length : Number(token);
      if (!Number.isInteger(index) || index < 0) {
        throw new Error(`Invalid array index '${token}' in patch path.`);
      }

      if (current[index] === undefined) {
        if (!createMissing) {
          throw new Error(`Patch path index '${token}' does not exist.`);
        }
        current[index] = {};
      }

      current = current[index];
      continue;
    }

    if (!isObject(current)) {
      throw new Error(`Patch path cannot traverse non-container at '${token}'.`);
    }

    if (!(token in current)) {
      if (!createMissing) {
        throw new Error(`Patch path segment '${token}' does not exist.`);
      }
      current[token] = {};
    }

    current = current[token];
  }

  return { parent: current, key: tokens[tokens.length - 1]! };
}

function getValue(root: unknown, tokens: string[]): unknown {
  let current = root;
  for (const token of tokens) {
    if (Array.isArray(current)) {
      const index = Number(token);
      if (!Number.isInteger(index) || index < 0 || index >= current.length) {
        throw new Error(`Patch read failed: index '${token}' is invalid.`);
      }
      current = current[index];
      continue;
    }

    if (!isObject(current) || !(token in current)) {
      throw new Error(`Patch read failed: segment '${token}' is missing.`);
    }

    current = current[token];
  }

  return current;
}

function removeValue(root: unknown, tokens: string[]): unknown {
  const { parent, key } = getParent(root, tokens, false);

  if (Array.isArray(parent)) {
    const index = Number(key);
    if (!Number.isInteger(index) || index < 0 || index >= parent.length) {
      throw new Error(`Patch remove failed: invalid index '${key}'.`);
    }
    return parent.splice(index, 1)[0];
  }

  if (!isObject(parent) || !(key in parent)) {
    throw new Error(`Patch remove failed: missing key '${key}'.`);
  }

  const previous = parent[key];
  delete parent[key];
  return previous;
}

function addValue(root: unknown, tokens: string[], value: unknown): void {
  const { parent, key } = getParent(root, tokens, true);

  if (Array.isArray(parent)) {
    if (key === '-') {
      parent.push(value);
      return;
    }

    const index = Number(key);
    if (!Number.isInteger(index) || index < 0 || index > parent.length) {
      throw new Error(`Patch add failed: invalid index '${key}'.`);
    }

    parent.splice(index, 0, value);
    return;
  }

  if (!isObject(parent)) {
    throw new Error(`Patch add failed: parent is not an object for key '${key}'.`);
  }

  parent[key] = value;
}

function replaceValue(root: unknown, tokens: string[], value: unknown): void {
  const { parent, key } = getParent(root, tokens, false);

  if (Array.isArray(parent)) {
    const index = Number(key);
    if (!Number.isInteger(index) || index < 0 || index >= parent.length) {
      throw new Error(`Patch replace failed: invalid index '${key}'.`);
    }
    parent[index] = value;
    return;
  }

  if (!isObject(parent) || !(key in parent)) {
    throw new Error(`Patch replace failed: missing key '${key}'.`);
  }

  parent[key] = value;
}

function toPatchRoot(current: StudioCurrentArtifactSet): PatchRoot {
  return {
    manifest: clone(current.manifest ?? null),
    entity_schema: clone(current.entity_schema ?? []),
    layout: clone(current.layout ?? []),
    action: clone(current.action ?? []),
    permission: clone(current.permission ?? []),
  };
}

function fromPatchRoot(root: PatchRoot, base: StudioCurrentArtifactSet): StudioCurrentArtifactSet {
  return {
    ...base,
    manifest: root.manifest as StudioCurrentArtifactSet['manifest'],
    entity_schema: root.entity_schema as StudioCurrentArtifactSet['entity_schema'],
    layout: root.layout as StudioCurrentArtifactSet['layout'],
    action: root.action as StudioCurrentArtifactSet['action'],
    permission: root.permission as StudioCurrentArtifactSet['permission'],
  };
}

export interface PatchApplyResult {
  ok: boolean;
  next: StudioCurrentArtifactSet;
  errors: string[];
}

export function applyPatchOperations(
  current: StudioCurrentArtifactSet,
  operations: PatchOperation[],
): PatchApplyResult {
  const root = toPatchRoot(current);
  const errors: string[] = [];

  for (const [index, operation] of operations.entries()) {
    try {
      const pathTokens = splitPointer(operation.path);

      switch (operation.op) {
        case 'add': {
          addValue(root, pathTokens, clone(operation.value));
          break;
        }
        case 'remove': {
          removeValue(root, pathTokens);
          break;
        }
        case 'replace': {
          replaceValue(root, pathTokens, clone(operation.value));
          break;
        }
        case 'move': {
          if (!operation.from) {
            throw new Error('move operation requires from');
          }
          const fromTokens = splitPointer(operation.from);
          const value = clone(getValue(root, fromTokens));
          removeValue(root, fromTokens);
          addValue(root, pathTokens, value);
          break;
        }
      }
    } catch (error) {
      errors.push(`patch[${index}] ${error instanceof Error ? error.message : 'unknown patch error'}`);
    }
  }

  return {
    ok: errors.length === 0,
    next: fromPatchRoot(root, current),
    errors,
  };
}
