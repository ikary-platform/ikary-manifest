import { useState } from 'react';
import type { ContractField } from '@ikary/cell-primitive-studio/ui';

function Chevron({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        flexShrink: 0,
        transition: 'transform 0.15s ease',
        transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
      }}
    >
      <path d="M2.5 4.5L6 8l3.5-3.5" />
    </svg>
  );
}

interface ContractSchemaPanelProps {
  fields: ContractField[];
  /** Label shown in the collapsible header. Defaults to "Contract Schema". */
  title?: string;
  /** Initial collapsed state. Defaults to false. */
  defaultCollapsed?: boolean;
}

export function ContractSchemaPanel({ fields, title = 'Contract Schema', defaultCollapsed = false }: ContractSchemaPanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  if (fields.length === 0) return null;

  return (
    <div
      style={{
        flex: '0 0 auto',
        maxHeight: collapsed ? '28px' : '200px',
        display: 'flex',
        flexDirection: 'column',
        borderTop: '1px solid hsl(var(--border))',
        transition: 'max-height 0.18s ease',
        overflow: 'hidden',
      }}
    >
      <button
        className="ide-sub-header ide-sub-header--clickable"
        onClick={() => setCollapsed((c) => !c)}
        style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left' }}
      >
        <span className="ide-sub-header-label">{title}</span>
        <Chevron collapsed={collapsed} />
      </button>
      <div style={{ overflow: 'auto', flex: 1 }}>
        {fields.map((field) => (
          <div
            key={field.name}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '8px',
              padding: '3px 12px',
              borderBottom: '1px solid hsl(var(--border))',
            }}
          >
            <code
              style={{
                fontFamily: 'monospace',
                fontSize: '11px',
                color: 'hsl(var(--foreground))',
                flexShrink: 0,
                minWidth: '110px',
              }}
            >
              {field.name}
              {!field.required && <span style={{ color: 'hsl(var(--muted-foreground))' }}>?</span>}
            </code>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '10px',
                color: '#7c3aed',
                flexShrink: 0,
                maxWidth: '130px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={field.type}
            >
              {field.type}
            </span>
            {field.description && (
              <span style={{ fontSize: '10px', color: 'hsl(var(--muted-foreground))' }}>
                {field.description}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
