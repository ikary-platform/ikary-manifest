export interface ActionDefinition {
  type: string;
  params?: Record<string, unknown>;
}

export interface RenderedAction {
  label: string;
  action: ActionDefinition;
}
