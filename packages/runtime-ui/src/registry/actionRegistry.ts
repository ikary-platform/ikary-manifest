import type { RuntimeContext } from './resolverRegistry';
import type { ActionDefinition } from '../types/ActionTypes';

export type ActionHandler = (context: RuntimeContext, params?: Record<string, unknown>) => Promise<void> | void;

const handlers = new Map<string, ActionHandler>();

export function registerAction(type: string, handler: ActionHandler): void {
  handlers.set(type, handler);
}

export function getAction(type: string): ActionHandler | undefined {
  return handlers.get(type);
}

export function listActions(): string[] {
  return Array.from(handlers.keys());
}

export async function runAction(context: RuntimeContext, action: ActionDefinition): Promise<void> {
  const handler = handlers.get(action.type);

  if (!handler) {
    console.warn(`[cell-runtime] Unknown action: "${action.type}"`);
    return;
  }

  await handler(context, action.params);
}
