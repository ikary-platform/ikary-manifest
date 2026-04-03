import { useState } from 'react';
import type { AuditEvent, EntityDefinition } from '@ikary-manifest/contract';
import { useCellRuntime } from '../context/cell-runtime-context';
import { DiffViewer } from './diff-viewer';

interface AuditTabProps {
  entity: EntityDefinition;
  recordId: string;
}

const EVENT_LABELS: Record<string, string> = {
  'entity.created': 'Created',
  'entity.updated': 'Updated',
  'entity.rollback': 'Rollback',
};

const EVENT_COLORS: Record<string, string> = {
  'entity.created':
    'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
  'entity.updated': 'bg-primary/10 text-primary border-primary/20',
  'entity.rollback':
    'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
};

export function AuditTab({ entity, recordId }: AuditTabProps) {
  const { dataStore } = useCellRuntime();
  const events = dataStore.getAuditEvents(entity.key, recordId);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  function fmt(ts: string): string {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? ts : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  }

  const filteredEvents = filter === 'all' ? events : events.filter((e) => e.eventType === filter);

  return (
    <div className="px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Audit Log</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {events.length} event{events.length !== 1 ? 's' : ''}
          </span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs border border-border rounded px-2 py-1 bg-background text-foreground"
          >
            <option value="all">All events</option>
            <option value="entity.created">Created</option>
            <option value="entity.updated">Updated</option>
            <option value="entity.rollback">Rollback</option>
          </select>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No audit events found.</p>
      ) : (
        <div className="space-y-2">
          {filteredEvents.map((event: AuditEvent) => {
            const isExpanded = expandedId === event.id;
            const colorClass = EVENT_COLORS[event.eventType] ?? 'bg-muted text-foreground border-border';

            return (
              <div key={event.id} className="border border-border rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted bg-background"
                  onClick={() => setExpandedId(isExpanded ? null : event.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${colorClass}`}>
                      {EVENT_LABELS[event.eventType] ?? event.eventType}
                    </span>
                    <span className="text-xs text-foreground">{event.description}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{fmt(event.timestamp)}</span>
                    <span className="text-xs text-muted-foreground">by {event.actor}</span>
                    {event.diff.length > 0 && (
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
                    )}
                  </div>
                </div>

                {isExpanded && event.diff.length > 0 && (
                  <div className="px-4 py-3 border-t border-border bg-muted/30">
                    <DiffViewer diffs={event.diff} entity={entity} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
