/**
 * Typed error thrown by `cellApiFetch` when the server returns a non-2xx status.
 */
export class CellApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly body: unknown,
  ) {
    super(message);
    this.name = 'CellApiError';
  }
}
