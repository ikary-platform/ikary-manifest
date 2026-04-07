import type { ResolvedCreateField } from '@ikary-manifest/engine';
import { FieldsTable } from './FieldsTable';

interface EditFieldsTabProps {
  fields: ResolvedCreateField[];
}

export function EditFieldsTab({ fields }: EditFieldsTabProps) {
  if (fields.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          No edit fields derived from this entity.
        </p>
      </div>
    );
  }

  return <FieldsTable fields={fields} mode="edit" />;
}
