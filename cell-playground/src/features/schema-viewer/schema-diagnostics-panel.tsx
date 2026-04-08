import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import type { SchemaGraphDiagnostic, SchemaGraphMetrics } from './schema-graph-model';

interface SchemaDiagnosticsPanelProps {
  readonly metrics: SchemaGraphMetrics;
  readonly diagnostics: readonly SchemaGraphDiagnostic[];
  readonly onSelectNode: (nodeId: string) => void;
}

export function SchemaDiagnosticsPanel({ metrics, diagnostics, onSelectNode }: SchemaDiagnosticsPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Diagnostics</CardTitle>
        <CardDescription>
          Structural checks for cycles, drift, unresolved references, and isolated nodes.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="flex flex-wrap gap-2">
          <MetricBadge label="Nodes" value={metrics.nodeCount} />
          <MetricBadge label="Edges" value={metrics.edgeCount} />
          <MetricBadge label="Leaves" value={metrics.leafCount} />
          <MetricBadge label="Roots" value={metrics.rootCount} />
          <MetricBadge label="Hotspots" value={metrics.hotspotCount} />
          <MetricBadge label="Cycles" value={metrics.cycleCount} />
          <MetricBadge label="Cross Ref" value={metrics.crossReferencedCount} />
          <MetricBadge label="Issues" value={diagnostics.length} />
        </div>

        <div className="rounded-md border border-border overflow-hidden">
          <div className="grid grid-cols-[auto_1.2fr_2fr_auto] gap-2 px-3 py-2 border-b border-border bg-muted/30 text-[11px] font-semibold text-muted-foreground">
            <span>Severity</span>
            <span>Code</span>
            <span>Message</span>
            <span>Focus</span>
          </div>

          {diagnostics.length === 0 ? (
            <div className="px-3 py-3 text-xs text-muted-foreground">
              No diagnostics detected for the current graph selection.
            </div>
          ) : (
            diagnostics.map((diagnostic) => (
              <div
                key={diagnostic.id}
                className="grid grid-cols-[auto_1.2fr_2fr_auto] gap-2 px-3 py-2 border-b border-border last:border-b-0 items-center"
              >
                <SeverityBadge severity={diagnostic.severity} />
                <code className="font-mono text-[11px] text-muted-foreground break-all">{diagnostic.code}</code>
                <span className="text-xs text-foreground break-words">{diagnostic.message}</span>
                {diagnostic.fromNodeId ? (
                  <button
                    type="button"
                    className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={() => onSelectNode(diagnostic.fromNodeId!)}
                  >
                    Open
                  </button>
                ) : (
                  <span className="text-[11px] text-muted-foreground">-</span>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MetricBadge({ label, value }: { label: string; value: number }) {
  return (
    <Badge variant="outline" className="text-[11px] font-medium">
      {label}: {value}
    </Badge>
  );
}

function SeverityBadge({ severity }: { severity: 'error' | 'warning' | 'info' }) {
  if (severity === 'error') {
    return (
      <Badge variant="destructive" className="text-[10px] uppercase">
        Error
      </Badge>
    );
  }
  if (severity === 'warning') {
    return (
      <Badge variant="secondary" className="text-[10px] uppercase">
        Warning
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[10px] uppercase">
      Info
    </Badge>
  );
}
