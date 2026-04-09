import { useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import { Bug, Eye, FileJson, ListTree, Loader2 } from 'lucide-react';
import { compileCellApp, isValidationResult } from '@ikary/cell-engine';
import { CellAppRenderer } from '@ikary/cell-runtime';
import { Button } from '../../../components/ui/button';
import type {
  StudioCurrentArtifactSet,
  StudioDebugTraceEvent,
  StudioOrchestrationResult,
  StudioPreviewModel,
} from '../contracts';

type StudioPreviewTab = 'preview' | 'manifest' | 'entities' | 'debug';

interface StudioPreviewPaneProps {
  preview: StudioPreviewModel;
  currentArtifacts: StudioCurrentArtifactSet;
  isBusy: boolean;
  statusWord: string | null;
  latestError: string | null;
  debugMode: boolean;
  onDebugModeChange: (enabled: boolean) => void;
  lastRunResult: StudioOrchestrationResult | null;
  debugTraces: StudioDebugTraceEvent[];
}

const TAB_ITEMS: Array<{ key: StudioPreviewTab; label: string; icon: ComponentType<{ className?: string }> }> = [
  { key: 'preview', label: 'Preview', icon: Eye },
  { key: 'manifest', label: 'Manifest Summary', icon: FileJson },
  { key: 'entities', label: 'Entity Summary', icon: ListTree },
  { key: 'debug', label: 'Debug', icon: Bug },
];

export function StudioPreviewPane({
  preview,
  currentArtifacts,
  isBusy,
  statusWord,
  latestError,
  debugMode,
  onDebugModeChange,
  lastRunResult,
  debugTraces,
}: StudioPreviewPaneProps) {
  const [tab, setTab] = useState<StudioPreviewTab>(debugMode ? 'debug' : 'preview');

  const compiled = useMemo(() => {
    if (!preview.compiledManifest) {
      return {
        manifest: null,
        errors: [] as string[],
      };
    }

    const result = compileCellApp(preview.compiledManifest);
    if (isValidationResult(result)) {
      return {
        manifest: null,
        errors: result.errors.map((error) => `${error.field}: ${error.message}`),
      };
    }

    return {
      manifest: result,
      errors: [] as string[],
    };
  }, [preview.compiledManifest]);

  const allCompileErrors = useMemo(() => {
    return [...new Set([...preview.compileErrors, ...compiled.errors])];
  }, [compiled.errors, preview.compileErrors]);
  const traceLines = useMemo(() => {
    return debugTraces.map((trace) => {
      const detailJson = trace.details !== undefined ? ` ${JSON.stringify(trace.details)}` : '';
      return `${trace.at} [${trace.level.toUpperCase()}] ${trace.source}/${trace.component}/${trace.stage}: ${trace.message}${detailJson}`;
    });
  }, [debugTraces]);

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-background">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Cell Preview</p>
            <p className="text-xs text-muted-foreground">Rendered only from latest validated artifacts.</p>
          </div>
          <Button
            type="button"
            variant={debugMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => onDebugModeChange(!debugMode)}
          >
            {debugMode ? 'Disable Debug' : 'Enable Debug'}
          </Button>
        </div>
      </div>

      <div className="border-b border-border px-2">
        <div className="flex flex-wrap gap-1 py-2">
          {TAB_ITEMS.map((item) => (
            <Button
              key={item.key}
              type="button"
              size="sm"
              variant={tab === item.key ? 'secondary' : 'ghost'}
              onClick={() => setTab(item.key)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {isBusy && (
        <div className="border-b border-border px-4 py-2 text-xs text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>{statusWord ?? 'Bambazoling'}</span>
        </div>
      )}

      {latestError && (
        <div className="border-b border-border px-4 py-2">
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1 text-xs text-destructive">
            {latestError}
          </div>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-auto p-4">
        {tab === 'preview' && (
          <div className="h-full min-h-[360px] rounded-md border border-border bg-muted/20">
            {isBusy && (
              <div className="space-y-3 p-4">
                <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                <div className="h-28 animate-pulse rounded bg-muted" />
                <div className="h-28 animate-pulse rounded bg-muted" />
              </div>
            )}

            {!isBusy && allCompileErrors.length > 0 && (
              <div className="space-y-2 p-4 text-sm text-destructive">
                {allCompileErrors.map((error) => (
                  <div key={error} className="rounded border border-destructive/30 bg-destructive/10 px-2 py-1">
                    {error}
                  </div>
                ))}
              </div>
            )}

            {!isBusy && allCompileErrors.length === 0 && compiled.manifest && (
              <div className="h-full">
                <CellAppRenderer key={compiled.manifest.metadata.key} manifest={compiled.manifest} />
              </div>
            )}

            {!isBusy && allCompileErrors.length === 0 && !compiled.manifest && (
              <div className="p-4 text-sm text-muted-foreground">Generate the initial Cell to render preview.</div>
            )}
          </div>
        )}

        {tab === 'manifest' && (
          <div className="space-y-3">
            {preview.manifestSummary ? (
              <>
                <div className="rounded-md border border-border bg-card px-3 py-2">
                  <p className="text-xs text-muted-foreground">Cell Key</p>
                  <p className="text-sm font-medium text-foreground">{preview.manifestSummary.cellKey}</p>
                </div>
                <div className="rounded-md border border-border bg-card px-3 py-2">
                  <p className="text-xs text-muted-foreground">Cell Name</p>
                  <p className="text-sm font-medium text-foreground">{preview.manifestSummary.cellName}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md border border-border bg-card px-3 py-2">
                    <p className="text-xs text-muted-foreground">Pages</p>
                    <p className="text-sm font-medium text-foreground">{preview.manifestSummary.pageCount}</p>
                  </div>
                  <div className="rounded-md border border-border bg-card px-3 py-2">
                    <p className="text-xs text-muted-foreground">Entities</p>
                    <p className="text-sm font-medium text-foreground">{preview.manifestSummary.entityCount}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                Manifest summary will appear after Phase 3 generation.
              </div>
            )}
          </div>
        )}

        {tab === 'entities' && (
          <div className="space-y-2">
            {preview.entitySummary.length === 0 && (
              <div className="rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                No entity schemas available yet.
              </div>
            )}
            {preview.entitySummary.map((entity) => (
              <div key={entity.key} className="rounded-md border border-border bg-card px-3 py-2">
                <p className="text-sm font-medium text-foreground">{entity.name}</p>
                <p className="text-xs text-muted-foreground">
                  Key: {entity.key} | Fields: {entity.fieldCount}
                </p>
              </div>
            ))}
          </div>
        )}

        {tab === 'debug' && (
          <div className="space-y-3">
            {!debugMode && (
              <div className="rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                Enable debug mode to inspect raw artifacts and validation traces.
              </div>
            )}
            {debugMode && (
              <>
                <div className="rounded-md border border-border bg-card px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Last run</p>
                  <pre className="mt-2 overflow-auto text-xs text-foreground">
                    {JSON.stringify(lastRunResult, null, 2)}
                  </pre>
                </div>
                <div className="rounded-md border border-border bg-card px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Current artifacts
                  </p>
                  <pre className="mt-2 overflow-auto text-xs text-foreground">
                    {JSON.stringify(currentArtifacts, null, 2)}
                  </pre>
                </div>
                <div className="rounded-md border border-border bg-card px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Compile errors
                  </p>
                  <pre className="mt-2 overflow-auto text-xs text-foreground">
                    {JSON.stringify(allCompileErrors, null, 2)}
                  </pre>
                </div>
                <div className="rounded-md border border-border bg-card px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Trace log</p>
                  <pre className="mt-2 max-h-72 overflow-auto text-xs text-foreground">
                    {traceLines.length > 0 ? traceLines.join('\n') : 'No traces recorded yet.'}
                  </pre>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
