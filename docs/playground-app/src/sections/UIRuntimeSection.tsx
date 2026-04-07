import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PrimitiveRenderer, RuntimeContextProvider } from '@ikary-manifest/primitives';
import { validatePresentation } from '@ikary-manifest/presentation';
import { JsonEditor } from '../components/JsonEditor';
import { PRIMITIVES, PRIMITIVE_SAMPLES } from '../data/primitive-samples';
import { PRIMITIVE_TREES } from '../data/primitive-trees';
import { MOCK_RUNTIME } from '../data/mock-runtime';

type RightTab = 'preview' | 'tree' | 'validation';

const RIGHT_TABS: Array<{ key: RightTab; label: string }> = [
  { key: 'preview', label: 'Preview' },
  { key: 'tree', label: 'Component Tree' },
  { key: 'validation', label: 'Validation' },
];

export function UIRuntimeSection() {
  const [searchParams, setSearchParams] = useSearchParams();

  const primitiveParam = searchParams.get('primitive');
  const primitive: string = primitiveParam && (PRIMITIVES as readonly string[]).includes(primitiveParam) ? primitiveParam : PRIMITIVES[0];

  const tabParam = searchParams.get('tab') as RightTab | null;
  const rightTab: RightTab = tabParam && RIGHT_TABS.some((t) => t.key === tabParam) ? tabParam : 'preview';

  const [json, setJson] = useState(() =>
    JSON.stringify(PRIMITIVE_SAMPLES[primitive], null, 2),
  );

  const handlePrimitiveChange = useCallback((p: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('primitive', p);
      return next;
    }, { replace: true });
    setJson(JSON.stringify(PRIMITIVE_SAMPLES[p] ?? {}, null, 2));
  }, [setSearchParams]);

  const setRightTab = (t: RightTab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (t === 'preview') next.delete('tab');
      else next.set('tab', t);
      return next;
    }, { replace: true });
  };

  const { props, parseError } = useMemo(() => {
    try {
      return { props: JSON.parse(json) as Record<string, unknown>, parseError: null };
    } catch (e) {
      return { props: {}, parseError: String(e) };
    }
  }, [json]);

  const validation = useMemo(() => {
    if (parseError) return null;
    return validatePresentation(props);
  }, [props, parseError]);

  const tree = PRIMITIVE_TREES[primitive] ?? [primitive];

  return (
    <div className="flex h-full">
      {/* Left panel: selector + JSON editor */}
      <div className="w-1/2 flex flex-col border-r border-gray-200">
        {/* Primitive selector */}
        <div className="shrink-0 flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
            Primitive
          </label>
          <select
            value={primitive}
            onChange={(e) => handlePrimitiveChange(e.target.value)}
            className="flex-1 rounded border border-gray-200 px-2 py-1 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {PRIMITIVES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <span className="shrink-0 text-xs text-gray-400">Presentation JSON</span>
        </div>

        <JsonEditor value={json} onChange={setJson} error={parseError} />
      </div>

      {/* Right panel: tabs */}
      <div className="w-1/2 flex flex-col">
        {/* Tab bar */}
        <div className="shrink-0 flex border-b border-gray-200 px-2 pt-1 gap-0.5">
          {RIGHT_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setRightTab(t.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-t border-b-2 transition-colors ${
                rightTab === t.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-auto">
          {rightTab === 'preview' && (
            <PreviewTab primitive={primitive} props={props} parseError={parseError} />
          )}
          {rightTab === 'tree' && <TreeTab tree={tree} primitive={primitive} />}
          {rightTab === 'validation' && (
            <ValidationTab validation={validation} parseError={parseError} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-panels ────────────────────────────────────────────────────────────────

function PreviewTab({
  primitive,
  props,
  parseError,
}: {
  primitive: string;
  props: Record<string, unknown>;
  parseError: string | null;
}) {
  if (parseError) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <p className="text-sm text-red-500 text-center">
          Fix the JSON parse error on the left to see the preview.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-full">
      <RuntimeContextProvider context={MOCK_RUNTIME}>
        <PrimitiveRenderer primitive={primitive} props={props} runtime={MOCK_RUNTIME} />
      </RuntimeContextProvider>
    </div>
  );
}

function TreeTab({ tree, primitive }: { tree: string[]; primitive: string }) {
  return (
    <div className="p-4">
      <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-semibold">
        Composition tree — {primitive}
      </p>
      <ul className="font-mono text-xs space-y-1 text-gray-700">
        {tree.map((node, i) => {
          const indent = node.match(/^(\s*)/)?.[1].length ?? 0;
          const text = node.trim();
          const isLeaf = indent > 0;
          return (
            <li
              key={i}
              style={{ paddingLeft: `${indent * 8}px` }}
              className={`leading-relaxed ${isLeaf ? 'text-gray-500' : 'text-gray-900 font-semibold'}`}
            >
              {indent > 0 && (
                <span className="text-gray-300 mr-1">{indent >= 4 ? '└─' : '├─'}</span>
              )}
              {text}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ValidationTab({
  validation,
  parseError,
}: {
  validation: ReturnType<typeof validatePresentation> | null;
  parseError: string | null;
}) {
  if (parseError) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-red-500 font-bold">✗</span>
          <span className="text-sm font-semibold text-red-600">JSON Parse Error</span>
        </div>
        <p className="text-xs text-red-500 font-mono">{parseError}</p>
      </div>
    );
  }

  if (!validation) {
    return (
      <div className="p-4">
        <p className="text-sm text-gray-400">No validation result.</p>
      </div>
    );
  }

  if (validation.ok) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-green-600 font-bold text-lg">✓</span>
          <span className="text-sm font-semibold text-green-700">Valid presentation contract</span>
        </div>
        <p className="text-xs text-gray-500">
          The JSON matches the expected schema for this primitive type.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-red-500 font-bold text-lg">✗</span>
        <span className="text-sm font-semibold text-red-600">
          {validation.errors.length} validation error{validation.errors.length !== 1 ? 's' : ''}
        </span>
      </div>
      <ul className="space-y-2">
        {validation.errors.map((e, i) => (
          <li key={i} className="rounded bg-red-50 border border-red-100 px-3 py-2">
            <div className="text-xs font-mono text-red-700 font-semibold">{e.path || 'root'}</div>
            <div className="text-xs text-red-600 mt-0.5">{e.message}</div>
            <div className="text-xs text-red-400 mt-0.5">{e.code}</div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-gray-400">
        Note: Validation only covers primitives with a full presentation schema (form, data-grid,
        page-header, detail-section, form-field, form-section, pagination).
      </p>
    </div>
  );
}
