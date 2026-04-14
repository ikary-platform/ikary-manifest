import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import '@ikary/cell-primitives/registry';
import { PrimitiveStudio } from '@ikary/cell-primitive-studio/ui';
import { usePrimitiveCatalog } from '../hooks/usePrimitiveCatalog';
import { MonacoJsonEditor } from '../components/MonacoJsonEditor';
import { MCP_API_URL } from '../lib/config';

const DEFAULT_PRIMITIVE = 'list-page';

export function UIRuntimeSection() {
  const [searchParams, setSearchParams] = useSearchParams();
  const primitiveKey = searchParams.get('primitive');

  // Default to list-page when no primitive is selected
  useEffect(() => {
    if (!primitiveKey) {
      setSearchParams({ primitive: DEFAULT_PRIMITIVE }, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { catalog, scenariosByKey, contractFieldsByKey } = usePrimitiveCatalog();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="ide-toolbar">
        <span className="ide-toolbar-label">UI Runtime</span>
      </div>
      <PrimitiveStudio
        catalog={catalog}
        scenariosByKey={scenariosByKey}
        contractFieldsByKey={contractFieldsByKey}
        initialKey={primitiveKey}
        onSelectPrimitive={(key) => setSearchParams({ primitive: key }, { replace: true })}
        hideSidebar
        renderContractEditor={({ value, onChange, primitiveKey: key }) => (
          <MonacoJsonEditor
            value={value}
            onChange={onChange}
            error={null}
            schemaUrl={key ? `${MCP_API_URL}/api/json-schema/primitive/${key}` : undefined}
            modelUri={`primitive://${key ?? 'none'}.json`}
          />
        )}
        renderRuntimeEditor={({ value, onChange }) => (
          <MonacoJsonEditor
            value={value}
            onChange={onChange}
            error={null}
            modelUri="primitive://runtime-context.json"
          />
        )}
      />
    </div>
  );
}

