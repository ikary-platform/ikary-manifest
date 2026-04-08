import { useState } from 'react';
import { JsonEditor } from '../components/JsonEditor';
import { AppPreview } from '../components/app-runtime/AppPreview';
import { SAMPLE_CELL_MANIFEST } from '../data/app-sample-manifest';

export function AppRuntimeSection() {
  const [json, setJson] = useState(SAMPLE_CELL_MANIFEST);

  const parseError = (() => {
    try {
      JSON.parse(json);
      return null;
    } catch (e) {
      return (e as Error).message;
    }
  })();

  return (
    <div className="flex h-full">
      {/* Left: JSON editor */}
      <div className="w-[38%] flex flex-col border-r border-gray-200 dark:border-gray-700">
        <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Cell Manifest
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">CellManifestV1 JSON</span>
        </div>
        <JsonEditor value={json} onChange={setJson} error={parseError} />
      </div>

      {/* Right: app preview */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="shrink-0 flex items-center px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Preview
          </span>
          <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
            Paste a compiled manifest or edit the sample to preview your app.
          </span>
        </div>
        <div className="flex-1 overflow-hidden">
          <AppPreview json={json} />
        </div>
      </div>
    </div>
  );
}
