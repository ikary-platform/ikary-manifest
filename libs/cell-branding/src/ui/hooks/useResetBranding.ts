import { useBrandingDataHooks } from './branding-data-hooks.js';

export function useResetBranding() {
  const hooks = useBrandingDataHooks();
  return hooks.useResetBranding();
}
