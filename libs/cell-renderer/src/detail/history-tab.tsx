import { useState } from 'react';
import type { EntityDefinition, EntityVersion } from '@ikary/cell-contract';
import { useCellRuntime } from '../context/cell-runtime-context';
import { DiffViewer } from './diff-viewer';

interface HistoryTabProps {
  entity: EntityDefinition;
  recordId: string;
}

interface RollbackState {
  version: number | null;
  confirming: boolean;
  done: boolean;
}

export function HistoryTab({ entity, recordId }: HistoryTabProps) {
  const { dataStore } = useCellRuntime();
  const versions = dataStore.getVersions(entity.key, recordId);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [rollback, setRollback] = useState<RollbackState>({
    version: null,
    confirming: false,
    done: false,
  });

  function handleRollback(version: number) {
    setRollback({ version, confirming: true, done: false });
  }

  function confirmRollback() {
    if (rollback.version === null) return;
    dataStore.rollback(entity.key, recordId, rollback.version);
    setRollback({ version: null, confirming: false, done: true });
    setTimeout(() => setRollback({ version: null, confirming: false, done: false }), 2000);
  }

  function fmt(ts: string): string {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? ts : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  }

  const currentVersion = versions[0]?.version ?? 1;

  if (versions.length === 0) {
    return <div className="px-6 py-8 text-center text-sm text-muted-foreground">No version history yet.</div>;
  }

  return (
    <div className="px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Version History</h3>
        <span className="text-xs text-muted-foreground">
          {versions.length} version{versions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {rollback.confirming && (
        <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
          <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
            Roll back to version {rollback.version}?
          </p>
          <p className="text-xs text-orange-700 dark:text-orange-400 mt-0.5">
            This will create a new version ({currentVersion + 1}) with the fields from v{rollback.version}. Previous
            history is preserved.
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={confirmRollback}
              className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Confirm Rollback
            </button>
            <button
              onClick={() => setRollback({ version: null, confirming: false, done: false })}
              className="px-3 py-1 text-xs border border-border rounded hover:bg-muted text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {rollback.done && (
        <div className="mb-4 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded text-xs text-green-700 dark:text-green-400">
          ✓ Rollback complete. New version created.
        </div>
      )}

      <div className="space-y-2">
        {versions.map((v: EntityVersion, i: number) => {
          const isCurrent = i === 0;
          const isExpanded = expanded === v.version;

          return (
            <div
              key={v.version}
              className={`border rounded-lg overflow-hidden border-border ${isCurrent ? 'border-primary/40' : ''}`}
            >
              <div
                className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted ${isCurrent ? 'bg-primary/5' : 'bg-background'}`}
                onClick={() => setExpanded(isExpanded ? null : v.version)}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono text-xs px-2 py-0.5 rounded ${isCurrent ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
                  >
                    v{v.version}
                  </span>
                  {isCurrent && (
                    <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">current</span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {v.diff.length > 0
                      ? `${v.diff.length} field${v.diff.length !== 1 ? 's' : ''} changed`
                      : v.version === 1
                        ? 'Initial version'
                        : 'No changes recorded'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{fmt(v.updatedAt)}</span>
                  <span className="text-xs text-muted-foreground">by {v.updatedBy}</span>
                  {!isCurrent && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRollback(v.version);
                      }}
                      className="text-xs text-orange-600 dark:text-orange-400 hover:underline"
                    >
                      Rollback
                    </button>
                  )}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className={`text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  >
                    <polyline points="2,4 6,8 10,4" />
                  </svg>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 py-3 border-t border-border bg-muted/30">
                  <DiffViewer diffs={v.diff} entity={entity} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
