import type { EntitySchema } from '../types/EntityTypes';

export interface RuntimeContext {
  entity: EntitySchema;

  record?: Record<string, unknown>;

  workspaceId?: string;
  tenantId?: string;
  transportMode?: 'fake' | 'http';

  user?: {
    id: string;
    name?: string;
  };

  permissions?: string[];

  actions: {
    navigate: (path: string) => void;
    mutate: (entity: string, payload: unknown) => Promise<void>;
    delete: (entity: string, id: string) => Promise<void>;
  };

  ui: {
    notify: (message: string) => void;
    confirm: (message: string) => Promise<boolean>;
  };
}

export type PrimitiveResolver = (context: RuntimeContext, props: Record<string, unknown>) => Record<string, unknown>;

const resolvers = new Map<string, PrimitiveResolver>();

export function registerResolver(name: string, resolver: PrimitiveResolver): void {
  resolvers.set(name, resolver);
}

export function getResolver(name: string): PrimitiveResolver | undefined {
  return resolvers.get(name);
}
