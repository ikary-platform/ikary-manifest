import { useState } from 'react';
import type { ZodTypeAny } from 'zod';
import type { ContractField } from '@ikary/cell-primitive-studio/ui';
import { extractContractFields } from '../lib/schema-introspection';
import { SCHEMA_REGISTRY } from '../lib/schema-registry';

// ── Icons ────────────────────────────────────────────────────────────────────

function ChevronDown({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 12 12"
      fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, transition: 'transform 0.15s ease', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
    >
      <path d="M2.5 4.5L6 8l3.5-3.5" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 2.5L8 6l-3.5 3.5" />
    </svg>
  );
}

function ArrowLeft() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6H3M3 6L6 3M3 6L6 9" />
    </svg>
  );
}

function ExternalLink() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V7" />
      <path d="M8 1h3v3M11 1L6 6" />
    </svg>
  );
}

// ── Navigation frame ─────────────────────────────────────────────────────────

interface NavFrame {
  /** Label shown in the header (schema name or field name) */
  label: string;
  fields: ContractField[];
  /** Catalog name for the ↗ link icon — undefined = no link */
  schemaName?: string;
}

// ── Main component ────────────────────────────────────────────────────────────

interface ContractSchemaPanelProps {
  fields: ContractField[];
  /** Header label for the root frame. Defaults to "Contract Schema". */
  title?: string;
  /** Catalog name for the root schema (e.g. 'CellManifestV1Schema') — enables the link icon. */
  schemaName?: string;
  /** Initial collapsed state. Defaults to false. */
  defaultCollapsed?: boolean;
}

export function ContractSchemaPanel({
  fields,
  title = 'Contract Schema',
  schemaName,
  defaultCollapsed = false,
}: ContractSchemaPanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [navStack, setNavStack] = useState<NavFrame[]>([{ label: title, fields, schemaName }]);

  // Reset nav stack when the root fields change (e.g. primitive changed in UI Runtime)
  const rootFieldsKey = fields.map((f) => f.name).join(',');
  const [prevRootKey, setPrevRootKey] = useState(rootFieldsKey);
  if (rootFieldsKey !== prevRootKey) {
    setNavStack([{ label: title, fields, schemaName }]);
    setPrevRootKey(rootFieldsKey);
  }

  if (fields.length === 0) return null;

  const current = navStack[navStack.length - 1];
  const canGoBack = navStack.length > 1;

  function drillInto(field: ContractField) {
    if (!field.subSchema) return;
    const sub = field.subSchema as ZodTypeAny;
    const subFields = extractContractFields(sub, SCHEMA_REGISTRY);
    if (subFields.length === 0) return;
    setNavStack((prev) => [
      ...prev,
      {
        label: field.subSchemaName ?? field.name,
        fields: subFields,
        schemaName: field.subSchemaName,
      },
    ]);
  }

  function goBack() {
    setNavStack((prev) => prev.slice(0, -1));
  }

  const schemaViewerHref = current.schemaName
    ? `/playground/contracts?schema=${current.schemaName}`
    : undefined;

  return (
    <div
      style={{
        flex: collapsed ? '0 0 28px' : '1 1 0',
        minHeight: collapsed ? undefined : '150px',
        display: 'flex',
        flexDirection: 'column',
        borderTop: '1px solid hsl(var(--border))',
        transition: 'flex 0.18s ease, min-height 0.18s ease',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div className="ide-sub-header" style={{ gap: '6px' }}>
        {canGoBack ? (
          <button
            onClick={goBack}
            title="Back"
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              border: 'none', background: 'transparent', cursor: 'pointer',
              padding: '0 4px 0 0', color: 'hsl(var(--muted-foreground))',
              fontSize: '11px',
            }}
          >
            <ArrowLeft />
          </button>
        ) : null}

        {/* Label — clickable to collapse only when at root */}
        <button
          className={canGoBack ? undefined : 'ide-sub-header--clickable'}
          onClick={canGoBack ? undefined : () => setCollapsed((c) => !c)}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: '6px',
            border: 'none', background: 'transparent', cursor: canGoBack ? 'default' : 'pointer',
            textAlign: 'left', padding: 0,
          }}
        >
          <span className="ide-sub-header-label" style={{ flex: 1 }}>
            {canGoBack ? (
              <>
                <span style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 400 }}>
                  {navStack[0].label}
                </span>
                {navStack.slice(1).map((frame, i) => (
                  <span key={i}>
                    <span style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 400, padding: '0 3px' }}>›</span>
                    {frame.label}
                  </span>
                ))}
              </>
            ) : (
              current.label
            )}
          </span>
          {!canGoBack && <ChevronDown collapsed={collapsed} />}
        </button>

        {/* External link to schema viewer */}
        {schemaViewerHref && (
          <a
            href={schemaViewerHref}
            target="_blank"
            rel="noreferrer"
            title={`Open ${current.schemaName} in Schema viewer`}
            style={{
              display: 'flex', alignItems: 'center',
              color: 'hsl(var(--muted-foreground))',
              opacity: 0.7,
              flexShrink: 0,
              padding: '2px',
              borderRadius: '3px',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.7'; }}
          >
            <ExternalLink />
          </a>
        )}
      </div>

      {/* Field rows */}
      <div style={{ overflow: 'auto', flex: 1 }}>
        {current.fields.map((field) => {
          const drillable = Boolean(field.subSchema) &&
            extractContractFields(field.subSchema as ZodTypeAny, SCHEMA_REGISTRY).length > 0;

          return (
            <div
              key={field.name}
              onClick={drillable ? () => drillInto(field) : undefined}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '8px',
                padding: '3px 12px',
                borderBottom: '1px solid hsl(var(--border))',
                cursor: drillable ? 'pointer' : 'default',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => { if (drillable) (e.currentTarget as HTMLElement).style.background = 'rgba(29,78,216,0.05)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}
            >
              <code
                style={{
                  fontFamily: 'monospace', fontSize: '11px',
                  color: 'hsl(var(--foreground))', flexShrink: 0, minWidth: '110px',
                }}
              >
                {field.name}
                {!field.required && <span style={{ color: 'hsl(var(--muted-foreground))' }}>?</span>}
              </code>
              <span
                style={{
                  fontFamily: 'monospace', fontSize: '10px',
                  color: field.subSchemaName ? '#7c3aed' : '#7c3aed',
                  flexShrink: 0, maxWidth: '150px',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
                title={field.type}
              >
                {field.type}
              </span>
              {field.description && (
                <span style={{ fontSize: '10px', color: 'hsl(var(--muted-foreground))', flex: 1 }}>
                  {field.description}
                </span>
              )}
              {drillable && (
                <span style={{ flexShrink: 0, color: 'hsl(var(--muted-foreground))', marginLeft: 'auto' }}>
                  <ChevronRight />
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
