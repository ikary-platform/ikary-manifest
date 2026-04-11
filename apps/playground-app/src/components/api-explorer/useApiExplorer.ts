import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import type { EntityDefinition } from '@ikary/contract';
import { deriveOpenAPISpec } from '@ikary/engine';
import type { OpenAPISpec } from '@ikary/engine';
import { MockEntityStore } from './MockEntityStore';
import { MockApiRouter } from './MockApiRouter';
import type { MockRequest, ExecutionResult } from './types';

export function useApiExplorer(entity: EntityDefinition) {
  const storeRef = useRef(new MockEntityStore(entity));
  const routerRef = useRef(new MockApiRouter(storeRef.current, entity.key));
  const [recordCount, setRecordCount] = useState(0);

  const spec = useMemo(() => deriveOpenAPISpec(entity), [entity]);

  // Track entity changes via serialized comparison
  const prevEntityJson = useRef(JSON.stringify(entity));

  useEffect(() => {
    const json = JSON.stringify(entity);
    if (json === prevEntityJson.current) return;
    prevEntityJson.current = json;

    const newStore = new MockEntityStore(entity);
    storeRef.current = newStore;
    routerRef.current = new MockApiRouter(newStore, entity.key);
    setRecordCount(0);
  }, [entity]);

  const execute = useCallback(
    async (req: MockRequest): Promise<ExecutionResult> => {
      const start = performance.now();

      // Simulate 50-150ms network latency
      const latency = 50 + (crypto.getRandomValues(new Uint32Array(1))[0]! / 0x100000000) * 100;
      await new Promise((resolve) => setTimeout(resolve, latency));

      const response = routerRef.current.dispatch(req);
      const durationMs = Math.round(performance.now() - start);

      setRecordCount(storeRef.current.getRecordCount());

      return {
        request: req,
        response,
        durationMs,
        timestamp: new Date(),
      };
    },
    [],
  );

  const seed = useCallback((count: number) => {
    storeRef.current.seed(count);
    setRecordCount(storeRef.current.getRecordCount());
  }, []);

  const resetStore = useCallback(() => {
    storeRef.current.reset();
    setRecordCount(0);
  }, []);

  return { spec, recordCount, execute, seed, resetStore } as const;
}
