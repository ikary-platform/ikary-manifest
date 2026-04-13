import { createContext, useContext, type ReactNode } from 'react';

export interface CellApiContextValue {
  apiBase: string;
  getToken: () => string | null;
}

const CellApiContext = createContext<CellApiContextValue | null>(null);

export function CellApiProvider({
  apiBase,
  getToken,
  children,
}: CellApiContextValue & { children: ReactNode }) {
  return <CellApiContext.Provider value={{ apiBase, getToken }}>{children}</CellApiContext.Provider>;
}

export function useCellApi(): CellApiContextValue {
  const ctx = useContext(CellApiContext);
  if (!ctx) throw new Error('useCellApi must be used inside <CellApiProvider>');
  return ctx;
}
