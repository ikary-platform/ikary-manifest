import { useEffect } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { useSchemaFetch } from '../hooks/useSchemaFetch';
import { useMonacoTheme, getTheme } from '../hooks/useMonacoTheme';

interface MonacoJsonEditorProps {
  value: string;
  onChange: (v: string) => void;
  error: string | null;
  /** URL to fetch a JSON Schema from; if absent or fetch fails, editor works as plain JSON */
  schemaUrl?: string;
  /** Stable model URI — unique per editor instance to scope IntelliSense correctly */
  modelUri: string;
  /** Passed as min-width inline style (needed for the collapse-panel animation) */
  minWidth?: string;
}

export function MonacoJsonEditor({
  value,
  onChange,
  error,
  schemaUrl,
  modelUri,
  minWidth,
}: MonacoJsonEditorProps) {
  const monaco = useMonaco();
  const schema = useSchemaFetch(schemaUrl);
  useMonacoTheme(monaco);

  // Register the JSON Schema with Monaco's language service whenever it arrives
  useEffect(() => {
    if (!monaco || !schema) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json = (monaco.languages as any).json;
    if (!json?.jsonDefaults) return;

    const existing = json.jsonDefaults.diagnosticsOptions;
    const otherSchemas = ((existing.schemas ?? []) as Array<{ fileMatch?: string[] }>).filter(
      (s) => !s.fileMatch?.includes(modelUri),
    );

    json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemas: [
        ...otherSchemas,
        {
          uri: schemaUrl ?? modelUri,
          fileMatch: [modelUri],
          schema,
        },
      ],
    });
  }, [monaco, schema, schemaUrl, modelUri]);

  return (
    <div
      className="flex flex-1 flex-col overflow-hidden"
      style={{ minWidth }}
    >
      <Editor
        language="json"
        value={value}
        theme={getTheme()}
        path={modelUri}
        onChange={(v) => onChange(v ?? '')}
        options={{
          minimap: { enabled: false },
          fontSize: 12,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'off',
          tabSize: 2,
          formatOnPaste: true,
          automaticLayout: true,
          scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          renderLineHighlight: 'none',
          contextmenu: false,
          quickSuggestionsDelay: 100,
        }}
      />
      {error && (
        <div className="shrink-0 px-3 py-1 bg-[rgba(239,68,68,0.08)] text-[#ef4444] text-[11px] border-t border-[rgba(239,68,68,0.3)] font-mono">
          {error}
        </div>
      )}
    </div>
  );
}
