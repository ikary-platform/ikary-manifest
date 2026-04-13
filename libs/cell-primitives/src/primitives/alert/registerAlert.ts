import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { Alert } from './Alert';
import { resolveAlert, type AlertResolverRuntime } from './Alert.resolver';
import type { AlertViewProps } from './Alert.types';

const alertResolver: PrimitiveResolver<unknown, AlertViewProps, AlertResolverRuntime> = (presentation, runtime) =>
  resolveAlert(presentation, runtime);

export function registerAlert(): void {
  registerPrimitive('alert', { component: Alert, resolver: alertResolver });
}

registerAlert();
