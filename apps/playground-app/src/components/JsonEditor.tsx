interface JsonEditorProps {
  value: string;
  onChange: (v: string) => void;
  error: string | null;
}

export function JsonEditor({ value, onChange, error }: JsonEditorProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 resize-none p-3 font-mono text-xs bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:bg-white dark:focus:bg-gray-900 transition-colors"
        spellCheck={false}
      />
      {error && (
        <div className="shrink-0 px-3 py-1.5 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-xs border-t border-red-200 dark:border-red-800">
          {error}
        </div>
      )}
    </div>
  );
}
