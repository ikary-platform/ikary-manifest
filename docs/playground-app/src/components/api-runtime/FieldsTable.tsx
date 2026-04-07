import type { FieldDefinition } from '@ikary/contract';
import type { ResolvedCreateField } from '@ikary/engine';

// ── Type badge color map ────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  string: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  text: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  number: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  boolean: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  date: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  datetime: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  enum: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
  object: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

// ── Props ───────────────────────────────────────────────────────────────────

interface FieldsTableProps {
  fields: FieldDefinition[] | ResolvedCreateField[];
  mode?: 'overview' | 'create' | 'edit';
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function isResolvedCreateField(
  field: FieldDefinition | ResolvedCreateField,
): field is ResolvedCreateField {
  return 'effectiveFieldRules' in field;
}

function isRequired(field: FieldDefinition | ResolvedCreateField): boolean {
  if (isResolvedCreateField(field)) {
    return field.effectiveFieldRules.some((r) => r.type === 'required');
  }
  return (field.validation?.fieldRules ?? []).some((r) => r.type === 'required');
}

function validationCount(field: FieldDefinition | ResolvedCreateField): number {
  if (isResolvedCreateField(field)) {
    return field.effectiveFieldRules.length;
  }
  return field.validation?.fieldRules?.length ?? 0;
}

function getChildren(
  field: FieldDefinition | ResolvedCreateField,
): (FieldDefinition | ResolvedCreateField)[] | undefined {
  if (isResolvedCreateField(field) && field.children) {
    return field.children;
  }
  if (field.type === 'object' && field.fields && field.fields.length > 0) {
    return field.fields;
  }
  return undefined;
}

// ── Type badge ──────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: string }) {
  const colors = TYPE_COLORS[type] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium leading-none ${colors}`}>
      {type}
    </span>
  );
}

// ── Boolean indicator ───────────────────────────────────────────────────────

function BoolCell({ value }: { value: boolean | undefined }) {
  if (!value) {
    return <span className="text-gray-300 dark:text-gray-600">-</span>;
  }
  return <span className="text-green-600 dark:text-green-400">Yes</span>;
}

// ── Overview row ────────────────────────────────────────────────────────────

function OverviewRow({
  field,
  depth,
}: {
  field: FieldDefinition | ResolvedCreateField;
  depth: number;
}) {
  const children = getChildren(field);
  const count = validationCount(field);

  return (
    <>
      <tr className="border-b border-gray-100 dark:border-gray-800">
        <td className="py-1.5 px-2 text-xs font-mono text-gray-700 dark:text-gray-300" style={{ paddingLeft: `${0.5 + depth * 1.25}rem` }}>
          {field.key}
        </td>
        <td className="py-1.5 px-2 text-xs text-gray-600 dark:text-gray-400">{field.name}</td>
        <td className="py-1.5 px-2 text-xs"><TypeBadge type={field.type} /></td>
        <td className="py-1.5 px-2 text-xs"><BoolCell value={isRequired(field)} /></td>
        <td className="py-1.5 px-2 text-xs"><BoolCell value={field.readonly} /></td>
        <td className="py-1.5 px-2 text-xs">
          {field.sensitive ? (
            <span className="text-red-600 dark:text-red-400">{field.sensitive}</span>
          ) : (
            <span className="text-gray-300 dark:text-gray-600">-</span>
          )}
        </td>
        <td className="py-1.5 px-2 text-xs text-center text-gray-500 dark:text-gray-400">
          {count > 0 ? count : <span className="text-gray-300 dark:text-gray-600">-</span>}
        </td>
      </tr>
      {children?.map((child) => (
        <OverviewRow key={child.key} field={child} depth={depth + 1} />
      ))}
    </>
  );
}

// ── Create / Edit row ───────────────────────────────────────────────────────

function CreateEditRow({
  field,
  depth,
}: {
  field: FieldDefinition | ResolvedCreateField;
  depth: number;
}) {
  const children = getChildren(field);
  const count = validationCount(field);
  const resolved = isResolvedCreateField(field);

  const order = resolved ? field.effectiveOrder : undefined;
  const placeholder = resolved ? field.effectivePlaceholder : undefined;
  const helpText = resolved ? field.effectiveHelpText : field.helpText;
  const readonly = resolved ? field.effectiveReadonly : field.readonly;

  return (
    <>
      <tr className="border-b border-gray-100 dark:border-gray-800">
        <td className="py-1.5 px-2 text-xs font-mono text-gray-700 dark:text-gray-300" style={{ paddingLeft: `${0.5 + depth * 1.25}rem` }}>
          {field.key}
        </td>
        <td className="py-1.5 px-2 text-xs text-gray-600 dark:text-gray-400">{field.name}</td>
        <td className="py-1.5 px-2 text-xs"><TypeBadge type={field.type} /></td>
        <td className="py-1.5 px-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          {order !== undefined ? order : <span className="text-gray-300 dark:text-gray-600">-</span>}
        </td>
        <td className="py-1.5 px-2 text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]" title={placeholder}>
          {placeholder ?? <span className="text-gray-300 dark:text-gray-600">-</span>}
        </td>
        <td className="py-1.5 px-2 text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]" title={helpText}>
          {helpText ?? <span className="text-gray-300 dark:text-gray-600">-</span>}
        </td>
        <td className="py-1.5 px-2 text-xs"><BoolCell value={readonly} /></td>
        <td className="py-1.5 px-2 text-xs text-center text-gray-500 dark:text-gray-400">
          {count > 0 ? count : <span className="text-gray-300 dark:text-gray-600">-</span>}
        </td>
      </tr>
      {children?.map((child) => (
        <CreateEditRow key={child.key} field={child} depth={depth + 1} />
      ))}
    </>
  );
}

// ── Table header style ──────────────────────────────────────────────────────

const TH =
  'py-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-left';

// ── Main component ──────────────────────────────────────────────────────────

export function FieldsTable({ fields, mode = 'overview' }: FieldsTableProps) {
  if (fields.length === 0) {
    return (
      <p className="px-2 py-3 text-xs text-gray-400 dark:text-gray-500 italic">
        No fields to display.
      </p>
    );
  }

  const isCreateEdit = mode === 'create' || mode === 'edit';

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          {isCreateEdit ? (
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className={TH}>Key</th>
              <th className={TH}>Name</th>
              <th className={TH}>Type</th>
              <th className={`${TH} text-center`}>Order</th>
              <th className={TH}>Placeholder</th>
              <th className={TH}>Help text</th>
              <th className={TH}>Readonly</th>
              <th className={`${TH} text-center`}>Rules</th>
            </tr>
          ) : (
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className={TH}>Key</th>
              <th className={TH}>Name</th>
              <th className={TH}>Type</th>
              <th className={TH}>Required</th>
              <th className={TH}>Readonly</th>
              <th className={TH}>Sensitive</th>
              <th className={`${TH} text-center`}>Rules</th>
            </tr>
          )}
        </thead>
        <tbody>
          {fields.map((field) =>
            isCreateEdit ? (
              <CreateEditRow key={field.key} field={field} depth={0} />
            ) : (
              <OverviewRow key={field.key} field={field} depth={0} />
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}
