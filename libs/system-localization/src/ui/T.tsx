import * as React from 'react';
import type { PrimitiveType } from 'react-intl';
import { useT } from './hooks/useT';

export interface TProps {
  id: string;
  values?: Record<string, PrimitiveType>;
}

export function T({ id, values }: TProps) {
  const t = useT();
  return <>{t(id, values)}</>;
}
