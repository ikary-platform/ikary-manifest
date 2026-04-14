import { useBrandingDataHooks } from './branding-data-hooks.js';

export function useBranding(cellId: string) {
  const hooks = useBrandingDataHooks();
  return hooks.useBranding(cellId);
}
