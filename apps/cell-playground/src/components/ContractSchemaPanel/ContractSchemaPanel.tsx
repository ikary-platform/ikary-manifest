import { useState } from 'react';
import type { ZodTypeAny } from 'zod';
import type { ContractField } from '@ikary/cell-primitive-studio/ui';
import { extractContractFields } from '../../lib/schema-introspection';
import { SCHEMA_REGISTRY } from '../../lib/schema-registry';
import { ChevronDownIcon, ArrowLeftIcon, ExternalLinkIcon } from '../icons';
import { SchemaFieldRow } from './SchemaFieldRow';

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
      className="flex flex-col border-t border-[hsl(var(--border))] overflow-hidden"
      style={{
        flex: collapsed ? '0 0 28px' : '1 1 0',
        minHeight: collapsed ? undefined : '150px',
        transition: 'flex 0.18s ease, min-height 0.18s ease',
      }}
    >
      {/* Header */}
      <div className="ide-sub-header gap-1.5">
        {canGoBack ? (
          <button
            onClick={goBack}
            title="Back"
            className="flex items-center gap-1 border-none bg-transparent cursor-pointer pr-1 text-[hsl(var(--muted-foreground))] text-[11px]"
          >
            <ArrowLeftIcon />
          </button>
        ) : null}

        {/* Label — clickable to collapse only when at root */}
        <button
          className={[
            'flex flex-1 items-center gap-1.5 border-none bg-transparent text-left p-0',
            canGoBack ? 'cursor-default' : 'cursor-pointer ide-sub-header--clickable',
          ].join(' ')}
          onClick={canGoBack ? undefined : () => setCollapsed((c) => !c)}
        >
          <span className="ide-sub-header-label flex-1">
            {canGoBack ? (
              <>
                <span className="text-[hsl(var(--muted-foreground))] font-normal">
                  {navStack[0].label}
                </span>
                {navStack.slice(1).map((frame, i) => (
                  <span key={i}>
                    <span className="text-[hsl(var(--muted-foreground))] font-normal px-[3px]">›</span>
                    {frame.label}
                  </span>
                ))}
              </>
            ) : (
              current.label
            )}
          </span>
          {!canGoBack && <ChevronDownIcon collapsed={collapsed} />}
        </button>

        {/* External link to schema viewer */}
        {schemaViewerHref && (
          <a
            href={schemaViewerHref}
            target="_blank"
            rel="noreferrer"
            title={`Open ${current.schemaName} in Schema viewer`}
            className="flex items-center text-[hsl(var(--muted-foreground))] shrink-0 p-0.5 rounded-[3px] no-underline opacity-70"
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.7'; }}
          >
            <ExternalLinkIcon />
          </a>
        )}
      </div>

      {/* Field rows */}
      <div className="overflow-auto flex-1">
        {current.fields.map((field) => {
          const drillable = Boolean(field.subSchema) &&
            extractContractFields(field.subSchema as ZodTypeAny, SCHEMA_REGISTRY).length > 0;

          return (
            <SchemaFieldRow
              key={field.name}
              field={field}
              drillable={drillable}
              onDrill={() => drillInto(field)}
            />
          );
        })}
      </div>
    </div>
  );
}
