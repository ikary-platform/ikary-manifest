import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { EntityDefinition } from '@ikary/cell-contract';
import { buildEntityListPath } from '@ikary/cell-engine';
import { useOptionalT } from '@ikary/system-localization/ui';
import { messages as rendererEnMessages } from '../i18n/en';
import { useUIComponents } from '../UIComponentsProvider';
import { useCellManifest, useCellRuntime } from '../context/cell-runtime-context';
import { PromotedMetadataRow } from './promoted-metadata-row';
import type { DetailPageMode } from './use-detail-page-mode';

interface DetailHeaderProps {
  entity: EntityDefinition;
  record: Record<string, unknown>;
  id: string;
  activeTab: string;
  mode: DetailPageMode;
  onEnterEdit?: () => void;
}

function getDisplayTitle(record: Record<string, unknown>, entity: EntityDefinition): string {
  const priorityKeys = ['name', 'title', 'subject', 'label', 'email'];
  for (const key of priorityKeys) {
    if (record[key] && typeof record[key] === 'string') return String(record[key]);
  }
  for (const field of entity.fields) {
    if (field.type === 'string' && record[field.key]) return String(record[field.key]);
  }
  return `${entity.name} #${String(record['id'])}`;
}

export function DetailHeader({ entity, record, id, activeTab, mode, onEnterEdit }: DetailHeaderProps) {
  const navigate = useNavigate();
  const manifest = useCellManifest();
  const { dataStore } = useCellRuntime();
  const t = useOptionalT(rendererEnMessages);
  const {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel,
    toast,
  } = useUIComponents();
  const listPath = buildEntityListPath(manifest, entity.key);
  const title = getDisplayTitle(record, entity);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const version = Number(record['_version'] ?? record['version'] ?? 1);
      await dataStore.delete(entity.key, id, version);
      toast.success(`${entity.name} deleted`);
      if (listPath) navigate(listPath);
    } catch (err: any) {
      toast.error(err?.message ?? 'Delete failed');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="px-6 pt-5 pb-0 border-b border-border bg-background shrink-0">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          {listPath && (
            <button
              onClick={() => navigate(listPath)}
              className="text-xs text-muted-foreground hover:text-foreground mb-1 flex items-center gap-1"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <polyline points="8,2 4,6 8,10" />
              </svg>
              {entity.pluralName}
            </button>
          )}
          <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
          <PromotedMetadataRow record={record} />
        </div>

        <div className="ml-4 flex items-center gap-2 shrink-0 mt-1">
          {activeTab === 'overview' && mode.editState === 'idle' && (
            <>
              <button
                onClick={onEnterEdit ?? mode.enterEdit}
                className="px-3 py-1.5 text-sm border border-border rounded text-foreground hover:bg-muted"
              >
                {t('entity.detail.edit_button')}
              </button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="px-3 py-1.5 text-sm border border-destructive/30 rounded text-destructive hover:bg-destructive/10">
                    {t('entity.detail.delete_button')}
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {entity.name}</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete &ldquo;{title}&rdquo;. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleting}>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={deleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleting ? 'Deleting\u2026' : t('entity.detail.delete_button')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
          {activeTab === 'overview' && mode.editState === 'saved' && (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">✓ Saved</span>
          )}
          {activeTab === 'overview' && mode.editState === 'error' && (
            <span className="text-xs text-destructive">{mode.saveError}</span>
          )}
        </div>
      </div>
    </div>
  );
}
