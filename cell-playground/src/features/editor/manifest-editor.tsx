interface ManifestEditorProps {
  value: string;
  onChange: (value: string) => void;
  hasError: boolean;
  placeholder?: string;
}

export function ManifestEditor({ value, onChange, hasError, placeholder = 'Paste JSON here…' }: ManifestEditorProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full h-full font-mono text-xs p-3 resize-none outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
        hasError ? 'border-l-2 border-l-red-500' : ''
      }`}
      spellCheck={false}
      placeholder={placeholder}
    />
  );
}
