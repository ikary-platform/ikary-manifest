import { useBrandingDataHooks } from './branding-data-hooks.js';

export function useUpdateBranding() {
  const hooks = useBrandingDataHooks();
  return hooks.useUpdateBranding();
}
