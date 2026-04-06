import { createContext, useContext } from 'react';
import type { CellManifestV1 } from '@ikary-manifest/contract';
import type { CellComponentRegistry } from '../registry/cell-component-registry';
import type { MockDataProvider } from '../providers/mock-data-provider';
import type { CellDataStore } from '../store/cell-data-store';
import type { CellDataMode } from '../components/cell-app-renderer';

export interface CellRuntimeContextValue {
  manifest: CellManifestV1;
  registry: CellComponentRegistry;
  mockDataProvider: MockDataProvider;
  dataStore: CellDataStore;
  dataMode: CellDataMode;
}

export const CellRuntimeContext = createContext<CellRuntimeContextValue | null>(null);

export function useCellRuntime(): CellRuntimeContextValue {
  const ctx = useContext(CellRuntimeContext);
  if (!ctx) throw new Error('useCellRuntime must be used inside CellRuntimeContext.Provider');
  return ctx;
}

export function useCellManifest(): CellManifestV1 {
  return useCellRuntime().manifest;
}
