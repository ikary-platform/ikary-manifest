import { FormField } from '../form-field/FormField';
import type {
  RelationFieldAttachViewProps,
  RelationFieldCreateViewProps,
  RelationFieldCreateOrAttachViewProps,
  RelationFieldOption,
  RelationFieldViewProps,
} from './RelationField.types';

export function RelationField(props: RelationFieldViewProps) {
  const containerClass = ['space-y-1.5', props.dense ? 'text-xs' : 'text-sm'].join(' ');

  if (props.mode === 'attach') {
    return (
      <div className={containerClass}>
        <AttachView {...props} />
        {props.message && <FieldMessage tone={props.message.tone} text={props.message.text} />}
      </div>
    );
  }

  if (props.mode === 'create') {
    return (
      <div className={containerClass}>
        <CreateView {...props} />
        {props.message && <FieldMessage tone={props.message.tone} text={props.message.text} />}
      </div>
    );
  }

  // create-or-attach
  return (
    <div className={containerClass}>
      <CreateOrAttachView {...props} />
      {props.message && <FieldMessage tone={props.message.tone} text={props.message.text} />}
    </div>
  );
}

function FieldLabel({ label, required, fieldId }: { label: string; required: boolean; fieldId: string }) {
  return (
    <label htmlFor={fieldId} className="text-sm font-medium text-gray-900 dark:text-gray-100">
      {label}
      {required && (
        <span aria-hidden="true" className="ml-1 text-red-600 dark:text-red-400">
          *
        </span>
      )}
    </label>
  );
}

function AttachView(props: RelationFieldAttachViewProps) {
  return (
    <div className="space-y-1.5">
      <FieldLabel label={props.label} required={props.required} fieldId={props.fieldId} />

      {props.selectedOption ? (
        <SelectedBadge
          option={props.selectedOption}
          disabled={props.disabled || props.readonly}
          onClear={() => props.onSelect(null)}
        />
      ) : (
        <div className="relative">
          <input
            id={props.fieldId}
            type="text"
            value={props.searchValue}
            placeholder={props.placeholder ?? 'Search…'}
            disabled={props.disabled || props.readonly}
            onChange={(e) => props.onSearchChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder-gray-500"
            aria-describedby={props.describedBy}
          />
          {props.isSearching && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">…</span>
          )}
          {props.searchResults.length > 0 && (
            <SearchDropdown results={props.searchResults} onSelect={props.onSelect} disabled={props.disabled} />
          )}
        </div>
      )}
    </div>
  );
}

function SelectedBadge({
  option,
  disabled,
  onClear,
}: {
  option: RelationFieldOption;
  disabled: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
        {option.label}
        {!disabled && (
          <button
            type="button"
            aria-label={`Remove ${option.label}`}
            onClick={onClear}
            className="ml-0.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            ×
          </button>
        )}
      </span>
    </div>
  );
}

function SearchDropdown({
  results,
  onSelect,
  disabled,
}: {
  results: RelationFieldOption[];
  onSelect: (opt: RelationFieldOption) => void;
  disabled: boolean;
}) {
  return (
    <ul
      role="listbox"
      className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900"
    >
      {results.map((opt) => (
        <li
          key={opt.id}
          role="option"
          aria-selected={false}
          className="cursor-pointer px-3 py-1.5 text-sm text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800"
          onClick={() => !disabled && onSelect(opt)}
        >
          {opt.label}
        </li>
      ))}
    </ul>
  );
}

function CreateView(props: RelationFieldCreateViewProps) {
  return (
    <div className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{props.label}</p>
      {props.createFields.map((field) => (
        <FormField {...field} />
      ))}
    </div>
  );
}

function CreateOrAttachView(props: RelationFieldCreateOrAttachViewProps) {
  return (
    <div className="space-y-1.5">
      <FieldLabel label={props.label} required={props.required} fieldId={props.fieldId} />
      <div className="flex gap-1 rounded-md border border-gray-200 bg-gray-100 p-0.5 dark:border-gray-700 dark:bg-gray-800">
        {(['attach', 'create'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={props.activeTab === tab}
            disabled={props.disabled || props.readonly}
            onClick={() => props.onTabChange(tab)}
            className={[
              'flex-1 rounded px-3 py-1 text-xs font-medium transition-colors',
              props.activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-950 dark:text-gray-100'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
            ].join(' ')}
          >
            {tab === 'attach' ? 'Select existing' : 'Create new'}
          </button>
        ))}
      </div>
      {props.activeTab === 'attach' ? (
        <AttachView {...props} {...props.attachProps} mode="attach" />
      ) : (
        <CreateView {...props} {...props.createProps} mode="create" />
      )}
    </div>
  );
}

function FieldMessage({ tone, text }: { tone: 'error' | 'warning' | 'success'; text: string }) {
  const className = {
    error: 'text-xs text-red-700 dark:text-red-300',
    warning: 'text-xs text-yellow-800 dark:text-yellow-300',
    success: 'text-xs text-green-700 dark:text-green-300',
  }[tone];
  return (
    <p role={tone === 'error' ? 'alert' : 'status'} className={className}>
      {text}
    </p>
  );
}
