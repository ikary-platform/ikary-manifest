export interface EntityField {
  key: string;
  name: string;
  type: string;
  enumValues?: string[];
  [key: string]: unknown;
}

export interface EntitySchema {
  key: string;
  name: string;
  pluralName: string;
  fields: EntityField[];
}
