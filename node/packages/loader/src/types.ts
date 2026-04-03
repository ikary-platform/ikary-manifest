import type { CellManifestV1, ValidationError } from '@ikary-manifest/contract';

export interface LoadManifestOptions {
  /** When true, skip semantic validation (only structural parse). Default: false */
  readonly structuralOnly?: boolean;
}

export interface LoadManifestResult {
  readonly valid: boolean;
  readonly errors: ValidationError[];
  readonly manifest?: CellManifestV1;
  /** The raw parsed object before Zod validation, useful for debugging */
  readonly raw?: unknown;
}
