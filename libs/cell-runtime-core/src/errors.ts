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

export class InvalidTransitionError extends Error {
  constructor(entityKey: string, transitionKey: string, currentState: string, expectedFrom: string) {
    super(
      `Cannot execute transition "${transitionKey}" on "${entityKey}": ` +
        `current state is "${currentState}", expected "${expectedFrom}"`,
    );
    this.name = 'InvalidTransitionError';
  }
}

export class CapabilityNotFoundError extends Error {
  constructor(entityKey: string, capabilityKey: string) {
    super(`Capability "${capabilityKey}" not found on entity "${entityKey}"`);
    this.name = 'CapabilityNotFoundError';
  }
}
