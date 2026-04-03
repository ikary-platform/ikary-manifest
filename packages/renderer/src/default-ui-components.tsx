/**
 * Default headless implementations of UIComponents.
 *
 * These are plain HTML elements that work without any CSS framework.
 * They serve as a fallback when no UIComponentsProvider wraps the tree.
 * Consumers of the renderer package should supply richer implementations
 * via UIComponentsProvider.
 */

import * as React from 'react';
import type {
  UIComponents,
  LabelProps,
  TextInputProps,
  NumberInputProps,
  TextareaProps,
  InfoBadgeProps,
  DataGridProps,
  ColumnDef,
  AlertDialogProps,
  AlertDialogTriggerProps,
  AlertDialogContentProps,
  AlertDialogHeaderProps,
  AlertDialogFooterProps,
  AlertDialogTitleProps,
  AlertDialogDescriptionProps,
  AlertDialogActionProps,
  AlertDialogCancelProps,
  ListPageLayoutProps,
  SearchInputProps,
  PaginationControlsProps,
} from './ui-components';

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ children, ...props }, ref) => (
  <label ref={ref} style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: 14 }} {...props}>
    {children}
  </label>
));
Label.displayName = 'Label';

// ---------------------------------------------------------------------------
// TextInput
// ---------------------------------------------------------------------------

const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>((props, ref) => (
  <input
    ref={ref}
    style={{
      display: 'block',
      width: '100%',
      padding: '6px 10px',
      border: '1px solid #ccc',
      borderRadius: 4,
      fontSize: 14,
      boxSizing: 'border-box',
    }}
    {...props}
  />
));
TextInput.displayName = 'TextInput';

// ---------------------------------------------------------------------------
// NumberInput
// ---------------------------------------------------------------------------

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>((props, ref) => (
  <input
    ref={ref}
    type="number"
    style={{
      display: 'block',
      width: '100%',
      padding: '6px 10px',
      border: '1px solid #ccc',
      borderRadius: 4,
      fontSize: 14,
      boxSizing: 'border-box',
    }}
    {...props}
  />
));
NumberInput.displayName = 'NumberInput';

// ---------------------------------------------------------------------------
// Textarea
// ---------------------------------------------------------------------------

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ rows = 3, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    style={{
      display: 'block',
      width: '100%',
      padding: '6px 10px',
      border: '1px solid #ccc',
      borderRadius: 4,
      fontSize: 14,
      boxSizing: 'border-box',
      resize: 'vertical',
    }}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

// ---------------------------------------------------------------------------
// InfoBadge
// ---------------------------------------------------------------------------

const BADGE_COLORS: Record<string, string> = {
  success: '#166534',
  warning: '#92400e',
  destructive: '#991b1b',
  info: '#1e40af',
  secondary: '#374151',
  outline: '#374151',
  default: '#374151',
};

const BADGE_BG: Record<string, string> = {
  success: '#dcfce7',
  warning: '#fef3c7',
  destructive: '#fee2e2',
  info: '#dbeafe',
  secondary: '#f3f4f6',
  outline: 'transparent',
  default: '#f3f4f6',
};

function InfoBadge({ variant = 'secondary', children, className }: InfoBadgeProps) {
  const color = BADGE_COLORS[variant] ?? BADGE_COLORS['secondary'];
  const bg = BADGE_BG[variant] ?? BADGE_BG['secondary'];
  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 500,
        color,
        backgroundColor: bg,
        border: variant === 'outline' ? `1px solid ${color}` : undefined,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// DataGrid
// ---------------------------------------------------------------------------

function DataGrid<TRow = Record<string, unknown>>({
  columns,
  rows,
  isLoading,
  sort,
  onSort,
  getRowId,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: DataGridProps<TRow>) {
  if (isLoading) {
    return <div style={{ padding: 16, color: '#6b7280', fontSize: 14 }}>Loading…</div>;
  }

  if (rows.length === 0) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        {emptyTitle && <p style={{ fontWeight: 600, marginBottom: 4 }}>{emptyTitle}</p>}
        {emptyDescription && (
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>{emptyDescription}</p>
        )}
        {emptyAction}
      </div>
    );
  }

  function parsedSort(): { key: string; dir: string } | null {
    if (!sort) return null;
    const i = sort.lastIndexOf('_');
    if (i <= 0) return null;
    return { key: sort.slice(0, i), dir: sort.slice(i + 1) };
  }

  const currentSort = parsedSort();

  function handleHeaderClick(col: ColumnDef<TRow>) {
    if (!col.sortKey || !onSort) return;
    if (currentSort?.key === col.sortKey) {
      onSort(currentSort.dir === 'asc' ? `${col.sortKey}_desc` : '');
    } else {
      onSort(`${col.sortKey}_asc`);
    }
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleHeaderClick(col)}
                style={{
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderBottom: '1px solid #e5e7eb',
                  fontWeight: 600,
                  fontSize: 13,
                  color: '#374151',
                  cursor: col.sortKey ? 'pointer' : 'default',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {col.header}
                {col.sortKey && currentSort?.key === col.sortKey && (
                  <span style={{ marginLeft: 4 }}>{currentSort.dir === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => {
            const rowId = getRowId ? getRowId(row) : String(rowIndex);
            return (
              <tr
                key={rowId}
                style={{ borderBottom: '1px solid #f3f4f6' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '';
                }}
              >
                {columns.map((col) => (
                  <td key={col.key} style={{ padding: '10px 12px', verticalAlign: 'top' }}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AlertDialog — simple <dialog>-based implementation
// ---------------------------------------------------------------------------

interface AlertDialogState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AlertDialogContext = React.createContext<AlertDialogState>({ open: false, setOpen: () => undefined });

function AlertDialog({ children }: AlertDialogProps) {
  const [open, setOpen] = React.useState(false);
  return <AlertDialogContext.Provider value={{ open, setOpen }}>{children}</AlertDialogContext.Provider>;
}

function AlertDialogTrigger({ children, asChild }: AlertDialogTriggerProps) {
  const { setOpen } = React.useContext(AlertDialogContext);
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: () => setOpen(true),
    });
  }
  return (
    <button type="button" onClick={() => setOpen(true)}>
      {children}
    </button>
  );
}

function AlertDialogContent({ children }: AlertDialogContentProps) {
  const { open, setOpen } = React.useContext(AlertDialogContext);
  if (!open) return null;
  return (
    <>
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
        }}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#fff',
          borderRadius: 8,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          padding: 24,
          zIndex: 1001,
          minWidth: 360,
          maxWidth: '90vw',
        }}
      >
        {children}
      </div>
    </>
  );
}

function AlertDialogHeader({ children }: AlertDialogHeaderProps) {
  return <div style={{ marginBottom: 16 }}>{children}</div>;
}

function AlertDialogFooter({ children }: AlertDialogFooterProps) {
  return <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>{children}</div>;
}

function AlertDialogTitle({ children }: AlertDialogTitleProps) {
  return <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{children}</h2>;
}

function AlertDialogDescription({ children }: AlertDialogDescriptionProps) {
  return <p style={{ margin: '8px 0 0', fontSize: 14, color: '#6b7280' }}>{children}</p>;
}

function AlertDialogAction({ children, onClick, disabled, ...rest }: AlertDialogActionProps) {
  const { setOpen } = React.useContext(AlertDialogContext);
  return (
    <button
      type="button"
      disabled={disabled}
      style={{
        padding: '8px 16px',
        borderRadius: 4,
        border: 'none',
        backgroundColor: '#dc2626',
        color: '#fff',
        fontWeight: 500,
        fontSize: 14,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
      onClick={(e) => {
        onClick?.(e);
        if (!disabled) setOpen(false);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

function AlertDialogCancel({ children, disabled, ...rest }: AlertDialogCancelProps) {
  const { setOpen } = React.useContext(AlertDialogContext);
  return (
    <button
      type="button"
      disabled={disabled}
      style={{
        padding: '8px 16px',
        borderRadius: 4,
        border: '1px solid #d1d5db',
        backgroundColor: '#fff',
        color: '#374151',
        fontWeight: 500,
        fontSize: 14,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
      onClick={() => !disabled && setOpen(false)}
      {...rest}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// ListPageLayout
// ---------------------------------------------------------------------------

function ListPageLayout({ title, actions, filterStart, filterEnd, pagination, children }: ListPageLayoutProps) {
  const hasToolbar = filterStart || filterEnd || actions;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {(title || actions) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          {title && <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{title}</h1>}
          {actions && <div>{actions}</div>}
        </div>
      )}
      {hasToolbar && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 24px',
            borderBottom: '1px solid #f3f4f6',
            flexWrap: 'wrap',
          }}
        >
          {filterStart}
          {filterEnd}
        </div>
      )}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>{children}</div>
      {pagination && (
        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          {pagination}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SearchInput
// ---------------------------------------------------------------------------

function SearchInput({ value, onChange, placeholder, className, ...rest }: SearchInputProps) {
  return (
    <input
      type="search"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      style={{
        padding: '6px 10px',
        border: '1px solid #d1d5db',
        borderRadius: 4,
        fontSize: 14,
      }}
      {...rest}
    />
  );
}

// ---------------------------------------------------------------------------
// PaginationControls
// ---------------------------------------------------------------------------

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function PaginationControls({ page, pageSize, total, onPageChange, onPageSizeChange }: PaginationControlsProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = Math.min((page - 1) * pageSize + 1, total);
  const end = Math.min(page * pageSize, total);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#6b7280' }}>
      <span>
        {total === 0 ? '0 results' : `${start}–${end} of ${total}`}
      </span>
      {onPageSizeChange && (
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          style={{ fontSize: 13, padding: '2px 6px', border: '1px solid #d1d5db', borderRadius: 4 }}
        >
          {PAGE_SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s} / page
            </option>
          ))}
        </select>
      )}
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        style={{
          padding: '4px 8px',
          fontSize: 13,
          border: '1px solid #d1d5db',
          borderRadius: 4,
          cursor: page <= 1 ? 'not-allowed' : 'pointer',
          opacity: page <= 1 ? 0.4 : 1,
          backgroundColor: '#fff',
        }}
        aria-label="Previous page"
      >
        &lsaquo;
      </button>
      <span>
        {page} / {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        style={{
          padding: '4px 8px',
          fontSize: 13,
          border: '1px solid #d1d5db',
          borderRadius: 4,
          cursor: page >= totalPages ? 'not-allowed' : 'pointer',
          opacity: page >= totalPages ? 0.4 : 1,
          backgroundColor: '#fff',
        }}
        aria-label="Next page"
      >
        &rsaquo;
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

const toast = {
  success(message: string) {
    // eslint-disable-next-line no-console
    console.log('[toast success]', message);
  },
  error(message: string) {
    // eslint-disable-next-line no-console
    console.error('[toast error]', message);
  },
  info(message: string) {
    // eslint-disable-next-line no-console
    console.info('[toast info]', message);
  },
  warning(message: string) {
    // eslint-disable-next-line no-console
    console.warn('[toast warning]', message);
  },
};

// ---------------------------------------------------------------------------
// Export the default implementation bundle
// ---------------------------------------------------------------------------

export const defaultUIComponents: UIComponents = {
  Label,
  TextInput,
  NumberInput,
  Textarea,
  InfoBadge,
  DataGrid: DataGrid as UIComponents['DataGrid'],
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  ListPageLayout,
  SearchInput,
  PaginationControls,
  toast,
};
