import { useEffect } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { useSchemaFetch } from '../hooks/useSchemaFetch';

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

/** Resolves the Monaco theme name from the current dark-mode state. */
function getTheme() {
  return document.documentElement.classList.contains('dark') ? 'vs-dark' : 'vs';
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

  // Sync Monaco theme whenever the <html> dark class changes
  useEffect(() => {
    if (!monaco) return;
    monaco.editor.setTheme(getTheme());

    const observer = new MutationObserver(() => {
      monaco.editor.setTheme(getTheme());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, [monaco]);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth,
        overflow: 'hidden',
      }}
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
        <div
          style={{
            flexShrink: 0,
            padding: '4px 12px',
            background: 'rgba(239,68,68,0.08)',
            color: '#ef4444',
            fontSize: '11px',
            borderTop: '1px solid rgba(239,68,68,0.3)',
            fontFamily: 'monospace',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
