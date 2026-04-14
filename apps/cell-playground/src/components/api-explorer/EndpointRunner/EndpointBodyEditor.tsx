import type { OpenAPISchema } from '@ikary/cell-engine';

// ── Props ─────────────────────────────────────────────────────────────────────

interface EndpointBodyEditorProps {
  body: string;
  onChange: (value: string) => void;
  bodySchema?: OpenAPISchema;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function EndpointBodyEditor({ body, onChange }: EndpointBodyEditorProps) {
  return (
    <div>
      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
        Request Body
      </h4>
      <textarea
        value={body}
        onChange={(e) => onChange(e.target.value)}
        rows={Math.min(body.split('\n').length + 1, 16)}
        className="block w-full text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono resize-y"
      />
    </div>
  );
}
