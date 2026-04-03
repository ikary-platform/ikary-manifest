import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { DataGridColumn } from '@ikary-manifest/presentation';
import type { ColumnDef, UIComponents } from '../ui-components';
import { useUIComponents } from '../UIComponentsProvider';

type Row = Record<string, unknown>;

interface CellDataGridProps {
  columns: DataGridColumn[];
  rows: Row[];
  sort: { field: string; direction: 'asc' | 'desc' } | null;
  onSortChange: (sort: { field: string; direction: 'asc' | 'desc' } | null) => void;
  getDetailHref?: (row: Row) => string | null;
  getRowId?: (row: Row) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  isLoading?: boolean;
}

function resolveStatusVariant(
  value: string,
): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' {
  switch (value.toLowerCase()) {
    case 'active':
    case 'approved':
    case 'complete':
    case 'completed':
    case 'success':
      return 'success';
    case 'warning':
    case 'pending':
    case 'review':
      return 'warning';
    case 'error':
    case 'failed':
    case 'blocked':
      return 'destructive';
    case 'info':
      return 'info';
    default:
      return 'secondary';
  }
}

function specToColumnDef(
  spec: DataGridColumn,
  InfoBadge: UIComponents['InfoBadge'],
  getDetailHref?: (row: Row) => string | null,
): ColumnDef<Row> {
  const fieldKey = spec.field ?? spec.key;

  const render = (row: Row): ReactNode => {
    const value = row[fieldKey];

    switch (spec.type) {
      case 'link': {
        const href = getDetailHref?.(row) ?? null;
        const label = value != null ? String(value) : '—';
        return href ? (
          <Link to={href} className="font-medium hover:underline" onClick={(e) => e.stopPropagation()}>
            {label}
          </Link>
        ) : (
          label
        );
      }

      case 'text':
        return String(value ?? '—');

      case 'number': {
        if (value == null) return '—';
        return Intl.NumberFormat(undefined).format(Number(value));
      }

      case 'currency': {
        if (value == null) return '—';
        const currency = spec.format?.currency;
        return currency
          ? Intl.NumberFormat(undefined, {
              style: 'currency',
              currency,
            }).format(Number(value))
          : String(value);
      }

      case 'date': {
        if (value == null) return '—';
        return new Date(String(value)).toLocaleDateString(undefined, {
          dateStyle: spec.format?.dateStyle ?? 'medium',
        });
      }

      case 'datetime': {
        if (value == null) return '—';
        return new Date(String(value)).toLocaleString(undefined, {
          dateStyle: spec.format?.datetimeStyle ?? 'medium',
          timeStyle: spec.format?.datetimeStyle === 'long' ? 'medium' : 'short',
        });
      }

      case 'boolean':
        return value ? 'Yes' : 'No';

      case 'badge':
      case 'enum':
        return <InfoBadge variant="secondary">{value != null ? String(value) : '—'}</InfoBadge>;

      case 'status': {
        const label = value != null ? String(value) : '—';
        return <InfoBadge variant={resolveStatusVariant(label)}>{label}</InfoBadge>;
      }

      case 'custom':
        return value != null ? String(value) : '—';

      case 'actions':
        return null;

      default:
        return String(value ?? '—');
    }
  };

  return {
    key: spec.key,
    header: spec.label,
    render,
    sortKey: spec.sortable ? (spec.sortField ?? fieldKey) : undefined,
  };
}

export function CellDataGrid({
  columns,
  rows,
  sort,
  onSortChange,
  getDetailHref,
  getRowId,
  emptyTitle,
  emptyDescription,
  emptyAction,
  isLoading,
}: CellDataGridProps) {
  const { DataGrid, InfoBadge } = useUIComponents();
  const sortString = sort ? `${sort.field}_${sort.direction}` : '';

  function handleSort(newSortString: string) {
    if (!newSortString) {
      onSortChange(null);
      return;
    }
    const lastUnder = newSortString.lastIndexOf('_');
    if (lastUnder <= 0) {
      onSortChange(null);
      return;
    }
    onSortChange({
      field: newSortString.slice(0, lastUnder),
      direction: newSortString.slice(lastUnder + 1) as 'asc' | 'desc',
    });
  }

  const mappedColumns = columns
    .filter((spec) => spec.hidden !== true)
    .map((spec) => specToColumnDef(spec, InfoBadge, getDetailHref));

  return (
    <DataGrid
      columns={mappedColumns}
      rows={rows}
      isLoading={isLoading}
      sort={sortString}
      onSort={handleSort}
      getRowId={getRowId}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyAction={emptyAction}
    />
  );
}
