export interface MockRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  query: Record<string, string>;
  body: Record<string, unknown> | null;
}

export interface MockResponse {
  status: number;
  body: unknown;
  headers: Record<string, string>;
}

export interface ExecutionResult {
  request: MockRequest;
  response: MockResponse;
  durationMs: number;
  timestamp: Date;
}
