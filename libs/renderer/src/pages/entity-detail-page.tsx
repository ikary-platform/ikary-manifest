import { useParams, useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { buildEntityListPath } from '@ikary/engine';
import { useT } from '@ikary/system-localization/ui';
import { useCellRuntime } from '../context/cell-runtime-context';
import { useCellManifest } from '../context/cell-runtime-context';
import { DetailHeader } from '../detail/detail-header';
import { DetailTabs } from '../detail/detail-tabs';
import { OverviewTab } from '../detail/overview-tab';
import { HistoryTab } from '../detail/history-tab';
import { AuditTab } from '../detail/audit-tab';
import { useDetailPageEdit } from '../detail/hooks/useDetailPageEdit';
import { resolveManifestEntity } from '../manifest/selectors';
import type { CellPageRendererProps } from '../registry/cell-component-registry';
import type { DetailTabDef } from '../detail/detail-tabs';

const STANDARD_TABS: DetailTabDef[] = [
  { key: 'overview', label: 'Overview', kind: 'overview', suffix: '' },
  { key: 'history', label: 'History', kind: 'history', suffix: 'history' },
  { key: 'audit', label: 'Audit Log', kind: 'audit', suffix: 'audit' },
];

export function EntityDetailPage({ entity }: CellPageRendererProps) {
  const { dataStore, dataMode } = useCellRuntime();
  const manifest = useCellManifest();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const t = useT();

  const record = dataStore.getOne(entity?.key ?? '', id ?? '');
  const resolvedEntity = entity ? resolveManifestEntity(manifest, entity.key) : undefined;
  const editFields = resolvedEntity?.editFields ?? [];

  const { mode, form, onEnterEdit } = useDetailPageEdit(record ?? {}, editFields);

  useEffect(() => {
    const isOnOverview = !location.pathname.endsWith('/history') && !location.pathname.endsWith('/audit');
    if (!isOnOverview && mode.isEditing) {
      mode.cancelEdit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  if (!entity) {
    return <div className="p-4 text-destructive text-sm">No entity configured for this page.</div>;
  }

  if (!id) {
    return <div className="p-4 text-destructive text-sm">Missing entity ID.</div>;
  }

  const isLiveLoading = dataMode === 'live' && !record;

  if (isLiveLoading) {
    return (
      <div className="flex flex-col h-full overflow-hidden animate-pulse p-6 space-y-4">
        <div className="h-6 w-48 rounded bg-muted" />
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-px bg-border" />
        <div className="space-y-3">
          <div className="h-10 rounded bg-muted" />
          <div className="h-10 rounded bg-muted" />
          <div className="h-10 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground mb-3">
          {t('entity.detail.not_found', { entityName: entity.name, id })}
        </p>
        <button
          onClick={() => {
            const lp = buildEntityListPath(manifest, entity.key);
            if (lp) navigate(lp);
          }}
          className="text-sm text-primary hover:underline"
        >
          &larr; {t('entity.detail.back_link', { pluralName: entity.pluralName })}
        </button>
      </div>
    );
  }

  const basePath = location.pathname.replace(/\/(history|audit)$/, '');

  const pathname = location.pathname;
  let activeTab = 'overview';
  if (pathname.endsWith('/history')) activeTab = 'history';
  else if (pathname.endsWith('/audit')) activeTab = 'audit';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <DetailHeader
        entity={entity}
        record={record}
        id={id}
        activeTab={activeTab}
        mode={mode}
        onEnterEdit={onEnterEdit}
      />
      <DetailTabs tabs={STANDARD_TABS} basePath={basePath} />
      <div className="flex-1 overflow-y-auto bg-muted/30 dark:bg-muted/10">
        <Routes>
          <Route
            index
            element={<OverviewTab entity={entity} record={record} recordId={id} mode={mode} form={form} />}
          />
          <Route path="history" element={<HistoryTab entity={entity} recordId={id} />} />
          <Route path="audit" element={<AuditTab entity={entity} recordId={id} />} />
        </Routes>
      </div>
    </div>
  );
}
