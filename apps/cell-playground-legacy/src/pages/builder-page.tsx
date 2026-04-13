import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { ManifestEditor } from '../features/editor/manifest-editor';
import { CompilerResultPanel } from '../features/compiler/compiler-result-panel';
import { PreviewPanel } from '../features/preview/preview-panel';
import { useBuilderState } from '../features/compiler/use-builder-state';
import type { BuilderMode } from '../features/compiler/use-builder-state';

const MODE_LABELS: Record<BuilderMode, string> = {
  app: 'App Builder',
  dashboard: 'Dashboard',
  list: 'List Page',
  detail: 'Detail Page',
  form: 'Form',
  'simple-entity': 'Simple Entity',
  'nested-entity': 'Nested Entity',
  'entity-belongs-to': 'Belongs To',
  'entity-has-many': 'One to Many',
  'entity-many-to-many': 'Many to Many',
  'entity-polymorphic': 'Polymorphic',
  'entity-all-relations': 'All Relations',
  'computed-expression': 'Expression Formula',
  'computed-aggregation': 'Aggregation Formula',
  'computed-conditional': 'Conditional Formula',
  'computed-all': 'All Formula Types',
  'lifecycle-simple': 'Simple Lifecycle',
  'lifecycle-guards': 'Lifecycle + Guards',
  'lifecycle-hooks': 'Lifecycle + Hooks',
  'lifecycle-full': 'Full Lifecycle',
  'events-entity': 'Entity Events',
  'events-lifecycle': 'Lifecycle Events',
  'events-full': 'Full Events',
  'capabilities-simple': 'Simple Capabilities',
  'capabilities-inputs': 'Capabilities + Inputs',
  'capabilities-full': 'Full Capabilities',
  'policies-basic': 'Basic Policies',
  'policies-conditional': 'Conditional Policies',
  'policies-field': 'Field Policies',
  'policies-roles': 'Policies + Roles',
  validation: 'Field Validations',
};

const MODE_PLACEHOLDERS: Record<BuilderMode, string> = {
  app: 'Paste your Cell manifest JSON here…',
  dashboard: 'Paste a PageDefinition JSON here…',
  list: 'Paste an EntityDefinition JSON here…',
  detail: 'Paste an EntityDefinition JSON here…',
  form: 'Paste an EntityDefinition JSON here…',
  'simple-entity': 'Paste an EntityDefinition JSON here…',
  'nested-entity': 'Paste an EntityDefinition JSON here…',
  'entity-belongs-to': 'Paste an EntityDefinition JSON here…',
  'entity-has-many': 'Paste an EntityDefinition JSON here…',
  'entity-many-to-many': 'Paste an EntityDefinition JSON here…',
  'entity-polymorphic': 'Paste an EntityDefinition JSON here…',
  'entity-all-relations': 'Paste an EntityDefinition JSON here…',
  'computed-expression': 'Paste an EntityDefinition JSON here…',
  'computed-aggregation': 'Paste an EntityDefinition JSON here…',
  'computed-conditional': 'Paste an EntityDefinition JSON here…',
  'computed-all': 'Paste an EntityDefinition JSON here…',
  'lifecycle-simple': 'Paste an EntityDefinition JSON here…',
  'lifecycle-guards': 'Paste an EntityDefinition JSON here…',
  'lifecycle-hooks': 'Paste an EntityDefinition JSON here…',
  'lifecycle-full': 'Paste an EntityDefinition JSON here…',
  'events-entity': 'Paste an EntityDefinition JSON here…',
  'events-lifecycle': 'Paste an EntityDefinition JSON here…',
  'events-full': 'Paste an EntityDefinition JSON here…',
  'capabilities-simple': 'Paste an EntityDefinition JSON here…',
  'capabilities-inputs': 'Paste an EntityDefinition JSON here…',
  'capabilities-full': 'Paste an EntityDefinition JSON here…',
  'policies-basic': 'Paste an EntityDefinition JSON here…',
  'policies-conditional': 'Paste an EntityDefinition JSON here…',
  'policies-field': 'Paste an EntityDefinition JSON here…',
  'policies-roles': 'Paste an EntityDefinition JSON here…',
  validation: 'Paste a FieldRuleDefinition[] array here…',
};

interface BuilderPageProps {
  mode: BuilderMode;
  onBack: () => void;
}

export function BuilderPage({ mode, onBack }: BuilderPageProps) {
  const state = useBuilderState(mode);
  const hasError = !!(state.parseError || state.validationErrors.length > 0);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-gray-50 dark:bg-gray-800 shrink-0">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-xs">
          ← Launchpad
        </Button>
        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 shrink-0" />
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{MODE_LABELS[mode]}</span>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" onClick={state.loadSample}>
            Load Sample
          </Button>
          <Button size="sm" variant="outline" onClick={state.reset}>
            Reset
          </Button>
          <button
            onClick={() => setDark((d) => !d)}
            title="Toggle dark mode"
            className="ml-1 p-1.5 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xs"
          >
            {dark ? '☀' : '🌙'}
          </button>
        </div>
      </div>

      {/* 2-column layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left column */}
        <div className="w-[40%] border-r flex flex-col shrink-0 min-h-0">
          <div className="flex-1 min-h-0">
            <ManifestEditor
              value={state.editorText}
              onChange={state.setEditorText}
              hasError={hasError}
              placeholder={MODE_PLACEHOLDERS[mode]}
            />
          </div>
          <div className="h-[38%] border-t shrink-0 overflow-hidden">
            <CompilerResultPanel
              mode={mode}
              manifest={state.manifest}
              parseError={state.parseError}
              validationErrors={state.validationErrors}
              translations={state.translations}
              setTranslation={state.setTranslation}
            />
          </div>
        </div>

        {/* Right column */}
        <div className="flex-1 min-w-0 flex flex-col">
          <PreviewPanel
            mode={mode}
            manifest={state.manifest}
            parseError={state.parseError}
            validationErrors={state.validationErrors}
            translations={state.translations}
          />
        </div>
      </div>
    </div>
  );
}
