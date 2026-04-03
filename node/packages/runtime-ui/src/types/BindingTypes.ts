export interface FieldBinding {
  field: string;
  format?: string;
}

export interface ValueBinding {
  value: unknown;
}

export type Binding = FieldBinding | ValueBinding;
