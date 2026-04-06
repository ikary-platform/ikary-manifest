import type { UIPrimitiveDefinition, RegisterablePrimitive, PrimitiveComponent } from '../types/PrimitiveTypes';

const registry = new Map<string, UIPrimitiveDefinition<any, any, any>>();

export function registerPrimitive<ContractProps = unknown, ResolvedProps = unknown, Context = unknown>(
  name: string,
  primitive: RegisterablePrimitive<ContractProps, ResolvedProps, Context>,
  options?: { isController?: boolean },
): void {
  const normalized = normalizeRegisterablePrimitive(primitive);

  registry.set(name, {
    name,
    component: normalized.component as PrimitiveComponent,
    resolver: normalized.resolver as UIPrimitiveDefinition<any, any, any>['resolver'],
    isController: options?.isController,
  });
}

export function getPrimitive(name: string): UIPrimitiveDefinition<any, any, any> | undefined {
  return registry.get(name);
}

export function listPrimitives(): UIPrimitiveDefinition<any, any, any>[] {
  return Array.from(registry.values());
}

function normalizeRegisterablePrimitive<ContractProps = unknown, ResolvedProps = unknown, Context = unknown>(
  primitive: RegisterablePrimitive<ContractProps, ResolvedProps, Context>,
): {
  component: PrimitiveComponent<ResolvedProps>;
  resolver?: UIPrimitiveDefinition<ContractProps, ResolvedProps, Context>['resolver'];
} {
  if (typeof primitive === 'function') {
    return { component: primitive as PrimitiveComponent<ResolvedProps> };
  }

  return {
    component: primitive.component,
    resolver: primitive.resolver,
  };
}
