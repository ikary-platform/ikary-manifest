import { createContext, useContext } from 'react';
import type { CellBranding } from '../../shared/cell-branding.schema.js';
import type {
  PatchCellBrandingInput,
  ResetCellBrandingInput,
} from '../../shared/cell-branding.requests.js';

export interface BrandingDataHooks {
  useBranding: (cellId: string) => readonly [CellBranding | null, boolean, unknown];
  useUpdateBranding: () => (cellId: string, input: PatchCellBrandingInput) => Promise<CellBranding>;
  useResetBranding: () => (cellId: string, input: ResetCellBrandingInput) => Promise<CellBranding>;
  brandingQueryKeys: {
    detail: (cellId: string) => unknown[];
  };
}

const BrandingDataHooksContext = createContext<BrandingDataHooks | null>(null);

export const BrandingDataHooksProvider = BrandingDataHooksContext.Provider;

export function useBrandingDataHooks(): BrandingDataHooks {
  const value = useContext(BrandingDataHooksContext);
  if (!value) {
    throw new Error(
      '[cell-branding] useBrandingDataHooks must be called inside a BrandingDataHooksProvider. ' +
        'Wrap your component tree with <BrandingDataHooksProvider value={...}> and pass either ' +
        'createLocalStorageBrandingHooks(...) or createLiveBrandingHooks(...).',
    );
  }
  return value;
}
