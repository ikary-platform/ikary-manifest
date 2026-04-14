import type { ContractField } from '@ikary/cell-primitive-studio/ui';
import { ChevronRightIcon } from '../icons';

// ── Props ─────────────────────────────────────────────────────────────────────

interface SchemaFieldRowProps {
  field: ContractField;
  drillable: boolean;
  onDrill: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SchemaFieldRow({ field, drillable, onDrill }: SchemaFieldRowProps) {
  return (
    <div
      key={field.name}
      onClick={drillable ? onDrill : undefined}
      className={[
        'flex items-baseline gap-2 py-[3px] px-3 border-b border-[hsl(var(--border))] transition-[background] duration-100',
        drillable ? 'cursor-pointer' : 'cursor-default',
      ].join(' ')}
      onMouseEnter={(e) => { if (drillable) (e.currentTarget as HTMLElement).style.background = 'rgba(29,78,216,0.05)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}
    >
      <code className="font-mono text-[11px] text-[hsl(var(--foreground))] shrink-0 min-w-[110px]">
        {field.name}
        {!field.required && <span className="text-[hsl(var(--muted-foreground))]">?</span>}
      </code>
      <span
        className="font-mono text-[10px] text-[#7c3aed] shrink-0 max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap"
        title={field.type}
      >
        {field.type}
      </span>
      {field.description && (
        <span className="text-[10px] text-[hsl(var(--muted-foreground))] flex-1">
          {field.description}
        </span>
      )}
      {drillable && (
        <span className="shrink-0 text-[hsl(var(--muted-foreground))] ml-auto">
          <ChevronRightIcon />
        </span>
      )}
    </div>
  );
}
