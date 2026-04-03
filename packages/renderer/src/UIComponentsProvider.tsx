import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { UIComponents } from './ui-components';
import { defaultUIComponents } from './default-ui-components';

const UIComponentsContext = createContext<UIComponents>(defaultUIComponents);

interface UIComponentsProviderProps {
  components: UIComponents;
  children: ReactNode;
}

/**
 * Provides a custom UIComponents implementation to the entire renderer tree.
 *
 * Wrap CellAppRenderer with this provider to supply design-system components
 * from e.g. @ikary/system-ux-ui or any other library.
 *
 * When no provider is present the tree falls back to the headless HTML defaults
 * exported from default-ui-components.tsx.
 *
 * @example
 * ```tsx
 * import { systemUxUIComponents } from './adapters/system-ux-ui-components';
 *
 * <UIComponentsProvider components={systemUxUIComponents}>
 *   <CellAppRenderer manifest={manifest} />
 * </UIComponentsProvider>
 * ```
 */
export function UIComponentsProvider({ components, children }: UIComponentsProviderProps) {
  return <UIComponentsContext.Provider value={components}>{children}</UIComponentsContext.Provider>;
}

/**
 * Returns the UIComponents from the nearest UIComponentsProvider,
 * falling back to the headless defaults.
 */
export function useUIComponents(): UIComponents {
  return useContext(UIComponentsContext);
}
