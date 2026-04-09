import type { Generated } from 'kysely';

export interface GovernedColumns {
  id: Generated<string>;
  version: Generated<number>;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
  deletedAt: Date | null;
}
