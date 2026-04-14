import { useState, useMemo } from 'react';
import type { OpenAPIOperation, OpenAPISpec } from '@ikary/cell-engine';
import type { MockRequest, ExecutionResult } from '../types';
import { generateExampleBody, buildDefaultPathParams } from './requestBuilders';

// ── Hook ──────────────────────────────────────────────────────────────────────

interface UseEndpointRequestArgs {
  method: string;
  path: string;
  operation: OpenAPIOperation;
  spec: OpenAPISpec;
  entityKey: string;
  onExecute: (request: MockRequest) => Promise<ExecutionResult>;
}

interface UseEndpointRequestResult {
  pathParams: Record<string, string>;
  setPathParam: (key: string, value: string) => void;
  queryParams: Record<string, string>;
  setQueryParam: (key: string, value: string) => void;
  body: string;
  setBody: (value: string) => void;
  executing: boolean;
  result: ExecutionResult | null;
  execute: () => Promise<void>;
}

export function useEndpointRequest({
  method,
  path,
  operation,
  spec,
  entityKey,
  onExecute,
}: UseEndpointRequestArgs): UseEndpointRequestResult {
  const upperMethod = method.toUpperCase();

  const pathParams0 = useMemo(
    () => buildDefaultPathParams(operation, entityKey),
    [operation, entityKey],
  );

  const hasPathId = path.includes('{id}');
  const isGetList = upperMethod === 'GET' && !hasPathId;
  const hasBody = upperMethod === 'POST' || upperMethod === 'PUT';

  const [pathParams, setPathParams] = useState<Record<string, string>>(pathParams0);
  const [queryParams, setQueryParams] = useState<Record<string, string>>({
    page: '1',
    pageSize: '20',
    sortField: '',
    sortDir: 'asc',
    search: '',
    filter: '',
  });
  const [body, setBody] = useState(() => generateExampleBody(operation, spec));
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);

  function setPathParam(key: string, value: string) {
    setPathParams((prev) => ({ ...prev, [key]: value }));
  }

  function setQueryParam(key: string, value: string) {
    setQueryParams((prev) => ({ ...prev, [key]: value }));
  }

  async function execute() {
    setExecuting(true);
    setResult(null);
    try {
      let resolvedPath = path;
      for (const [key, val] of Object.entries(pathParams)) {
        resolvedPath = resolvedPath.replace(
          `{${key}}`,
          encodeURIComponent(val),
        );
      }

      // Build query: strip empty values for GET list requests
      const query: Record<string, string> = {};
      if (isGetList) {
        for (const [k, v] of Object.entries(queryParams)) {
          if (v) query[k] = v;
        }
      }

      const request: MockRequest = {
        method: upperMethod as MockRequest['method'],
        path: resolvedPath,
        query,
        body: hasBody ? JSON.parse(body) : null,
      };

      const res = await onExecute(request);
      setResult(res);
    } catch (err) {
      setResult({
        request: {
          method: upperMethod as MockRequest['method'],
          path,
          query: {},
          body: null,
        },
        response: {
          status: 400,
          body: { error: String(err) },
          headers: {},
        },
        durationMs: 0,
        timestamp: new Date(),
      });
    } finally {
      setExecuting(false);
    }
  }

  return {
    pathParams,
    setPathParam,
    queryParams,
    setQueryParam,
    body,
    setBody,
    executing,
    result,
    execute,
  };
}
