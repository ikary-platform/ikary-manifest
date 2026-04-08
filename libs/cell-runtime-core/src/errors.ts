export class EntityNotFoundError extends Error {
  constructor(entityKey: string, id: string) {
    super(`Entity not found: ${entityKey}/${id}`);
    this.name = 'EntityNotFoundError';
  }
}

export class VersionConflictError extends Error {
  constructor(entityKey: string, id: string, expected: number, actual: number) {
    super(`Version conflict: ${entityKey}/${id} expected v${expected}, got v${actual}`);
    this.name = 'VersionConflictError';
  }
}
