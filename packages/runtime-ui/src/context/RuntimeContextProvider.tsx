import { createContext, useContext, type ReactNode } from 'react';
import type { RuntimeContext } from '../registry/resolverRegistry';

const Ctx = createContext<RuntimeContext | null>(null);

export function RuntimeContextProvider({ context, children }: { context: RuntimeContext; children: ReactNode }) {
  return <Ctx.Provider value={context}>{children}</Ctx.Provider>;
}

export function useRuntimeContext(): RuntimeContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('[cell-runtime] useRuntimeContext must be used inside renderLayout');
  return ctx;
}

export function useRuntimeContextOptional(): RuntimeContext | null {
  return useContext(Ctx);
}
