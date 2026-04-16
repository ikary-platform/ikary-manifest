import type { ReactNode } from 'react';
import type { FilteredWorkspaceProps } from './FilteredWorkspacePresentationSchema';
import {
  Badge,
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../shared/ui';
import { SectionShell } from '../../shared/SectionShell';

export interface FilteredWorkspaceSlots {
  'toolbar-leading'?: ReactNode;
  'toolbar-trailing'?: ReactNode;
  summary?: ReactNode;
  content?: ReactNode;
  aside?: ReactNode;
  empty?: ReactNode;
}

export interface FilteredWorkspaceViewProps extends FilteredWorkspaceProps {
  slots?: FilteredWorkspaceSlots;
}

function LoadingContent() {
  return (
    <div className="flex flex-col gap-2" aria-busy="true">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-10 w-full animate-pulse rounded-md bg-muted"
          style={{ opacity: 1 - i * 0.12 }}
        />
      ))}
    </div>
  );
}

function DefaultEmpty() {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 p-6 text-center">
      <p className="text-sm font-semibold">Nothing matches these filters</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Try loosening a filter, clearing the search, or broadening the date range.
      </p>
    </div>
  );
}

export function FilteredWorkspace({
  title,
  resultCount,
  isEmpty = false,
  isLoading = false,
  asidePosition = 'right',
  slots,
}: FilteredWorkspaceViewProps) {
  const hasAside = asidePosition !== 'hidden' && Boolean(slots?.aside);
  const showEmpty = isEmpty && !isLoading;

  return (
    <SectionShell>
      <Card>
        <CardHeader>
          <div className="col-start-1 flex flex-wrap items-center gap-2">
            {title ? <CardTitle className="text-base">{title}</CardTitle> : null}
            {typeof resultCount === 'number' ? (
              <Badge variant="outline">
                {resultCount.toLocaleString()} {resultCount === 1 ? 'result' : 'results'}
              </Badge>
            ) : null}
            {slots?.['toolbar-leading'] ? (
              <div className="flex flex-wrap items-center gap-2">
                {slots['toolbar-leading']}
              </div>
            ) : null}
          </div>
          {slots?.['toolbar-trailing'] ? (
            <CardAction>
              <div className="flex flex-wrap items-center gap-2">
                {slots['toolbar-trailing']}
              </div>
            </CardAction>
          ) : null}
        </CardHeader>

        {slots?.summary ? (
          <div className="px-6">
            <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              {slots.summary}
            </div>
          </div>
        ) : null}

        <CardContent>
          <div
            className={[
              'grid gap-4',
              hasAside
                ? 'grid-cols-1 lg:grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)]'
                : 'grid-cols-1',
            ].join(' ')}
          >
            <div className="min-w-0">
              {isLoading ? (
                <LoadingContent />
              ) : showEmpty ? (
                slots?.empty ?? <DefaultEmpty />
              ) : (
                slots?.content
              )}
            </div>
            {hasAside ? (
              <aside className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-4">
                {slots!.aside}
              </aside>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </SectionShell>
  );
}
