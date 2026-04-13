import { createContext, useContext } from 'react';
import type { CellManifestV1 } from '@ikary/cell-contract';
import type { MockEntityStore } from '../api-explorer/MockEntityStore';
import type { ResolvedEntity } from './manifest-helpers';

export interface AppRuntimeContextValue {
  manifest: CellManifestV1;
  stores: Map<string, MockEntityStore>;
  entities: Map<string, ResolvedEntity>;
  currentPath: string;
  navigate: (path: string) => void;
}

const AppRuntimeCtx = createContext<AppRuntimeContextValue | null>(null);

export const AppRuntimeProvider = AppRuntimeCtx.Provider;

export function useAppRuntime(): AppRuntimeContextValue {
  const ctx = useContext(AppRuntimeCtx);
  if (!ctx) throw new Error('useAppRuntime must be used inside AppRuntimeProvider');
  return ctx;
}

export function useAppStore(entityKey: string): MockEntityStore | undefined {
  return useAppRuntime().stores.get(entityKey);
}

export function useAppEntity(entityKey: string): ResolvedEntity | undefined {
  return useAppRuntime().entities.get(entityKey);
}

export function useAppNavigate(): (path: string) => void {
  return useAppRuntime().navigate;
}
