import { useMemo, useState } from 'react';
import type { ResolvedCreateField } from '@ikary/cell-engine';
import type {
  CellManifestV1,
  ValidationError,
  FieldDefinition,
  FieldRuleDefinition,
  ComputedFieldDefinition,
  LifecycleDefinition,
  EventDefinition,
  CapabilityDefinition,
  EntityPoliciesDefinition,
  FieldPoliciesDefinition,
  RoleDefinition,
} from '@ikary/cell-contract-core';
import type { BuilderMode } from './use-builder-state';
import { Badge } from '../../components/ui/badge';
import { deriveManifestPreviewData } from '../shared/manifest-preview-data';
import type { ManifestPreviewData, ManifestPreviewEntity } from '../shared/manifest-preview-data';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Recursively flatten all non-object compiled fields (including nested children). */
function flattenCompiledFields(fields: ResolvedCreateField[]): ResolvedCreateField[] {
  const result: ResolvedCreateField[] = [];
  for (const f of fields) {
    if (f.type === 'object') {
      result.push(...flattenCompiledFields(f.children ?? []));
    } else {
      result.push(f);
    }
  }
  return result;
}

/** Collect all top-level object fields from a raw FieldDefinition list. */
function collectTopLevelGroups(fields: FieldDefinition[]): FieldDefinition[] {
  return fields.filter((f) => f.type === 'object');
}

// ── Translations tab ───────────────────────────────────────────────────────────

function TranslationsTab({
  translations,
  setTranslation,
}: {
  translations: Record<string, string>;
  setTranslation: (key: string, value: string) => void;
}) {
  const entries = Object.entries(translations);

  if (entries.length === 0) {
    return <p className="text-xs text-gray-400">No translation keys yet — load a sample or paste valid JSON.</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-gray-400 mb-2">
        {entries.length} key{entries.length !== 1 ? 's' : ''} · edit values to override translations
      </p>
      {entries.map(([key, value]) => (
        <div key={key}>
          <div className="text-[10px] font-mono text-gray-400 dark:text-gray-500 mb-0.5 truncate" title={key}>
            {key}
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => setTranslation(key, e.target.value)}
            className="w-full text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-blue-400 dark:focus:border-blue-500"
          />
        </div>
      ))}
    </div>
  );
}

// ── Shared ────────────────────────────────────────────────────────────────────

function StatusView({
  compiledApp,
  parseError,
  validationErrors,
  emptyLabel,
}: {
  compiledApp: ManifestPreviewData | null;
  parseError: string | null;
  validationErrors: ValidationError[];
  emptyLabel: string;
}) {
  if (!compiledApp && !parseError && validationErrors.length === 0) {
    return <p className="text-xs text-gray-400">{emptyLabel}</p>;
  }

  if (!parseError && validationErrors.length === 0) {
    return (
      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs">
        <span>✓</span>
        <span>Valid — no errors.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {parseError && (
        <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          <p className="text-xs font-semibold text-red-700 dark:text-red-400">JSON Parse Error</p>
          <p className="text-xs text-red-600 dark:text-red-300 mt-0.5">{parseError}</p>
        </div>
      )}
      {validationErrors.map((err, i) => (
        <div
          key={i}
          className="p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded"
        >
          <p className="text-xs font-mono text-orange-700 dark:text-orange-400">{err.field}</p>
          <p className="text-xs text-orange-600 dark:text-orange-300 mt-0.5">{err.message}</p>
        </div>
      ))}
    </div>
  );
}

// ── App mode — tabbed summary (multiple building blocks) ─────────────────────

const RULE_COLORS: Record<string, string> = {
  required: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-700',
  min_length: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700',
  max_length:
    'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-700',
  regex:
    'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-700',
  email: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-700',
  number_min: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-700',
  number_max:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700',
};

function ruleColor(type: string): string {
  return (
    RULE_COLORS[type] ??
    'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
  );
}

function ruleLabel(rule: FieldRuleDefinition): string {
  switch (rule.type) {
    case 'min_length':
      return `min ${rule.params?.min ?? '?'} chars`;
    case 'max_length':
      return `max ${rule.params?.max ?? '?'} chars`;
    case 'number_min':
      return `≥ ${rule.params?.min ?? rule.params?.minExclusive ?? '?'}`;
    case 'number_max':
      return `≤ ${rule.params?.max ?? '?'}`;
    case 'regex':
      return `/${rule.params?.pattern ?? '?'}/`;
    default:
      return rule.type.replace(/_/g, ' ');
  }
}

/** Renders a list of compiled fields with their rules. Key is the source of truth. */
function FieldRuleRows({ fields }: { fields: ResolvedCreateField[] }) {
  const fieldsWithRules = fields.filter((f) => f.effectiveFieldRules.length > 0);
  if (fieldsWithRules.length === 0) return null;
  return (
    <div className="space-y-1.5">
      {fieldsWithRules.map((field) => (
        <div key={field.key} className="flex items-start gap-2">
          <div className="w-28 shrink-0 pt-0.5">
            {/* Key is the source of truth — shown as primary */}
            <div
              className="text-[10px] font-mono text-gray-700 dark:text-gray-300 leading-tight truncate"
              title={field.key}
            >
              {field.key}
            </div>
            <div className="text-[9px] text-gray-400 italic truncate">{field.name}</div>
          </div>
          <div className="flex flex-wrap gap-1 flex-1">
            {field.effectiveFieldRules.map((rule) => (
              <Badge
                key={rule.ruleId}
                variant="outline"
                title={rule.messageKey}
                className={`gap-1 text-[10px] font-medium leading-none px-1.5 py-0.5 ${ruleColor(rule.type)}`}
              >
                {ruleLabel(rule)}
                {!rule.clientSafe && <span className="opacity-60">🔒</span>}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EntityValidationSection({ entity }: { entity: ManifestPreviewEntity }) {
  const allFields = flattenCompiledFields(entity.createFields);
  const fieldsWithRules = allFields.filter((f) => f.effectiveFieldRules.length > 0);
  if (fieldsWithRules.length === 0) return null;
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          {entity.name}
        </span>
        <span className="text-[10px] text-gray-400">
          ({fieldsWithRules.length} field{fieldsWithRules.length !== 1 ? 's' : ''})
        </span>
      </div>
      <FieldRuleRows fields={fieldsWithRules} />
    </div>
  );
}

type AppTab = 'summary' | 'validation' | 'errors' | 'translations';

function AppModePanel({
  compiledApp,
  parseError,
  validationErrors,
  translations,
  setTranslation,
}: {
  compiledApp: ManifestPreviewData | null;
  parseError: string | null;
  validationErrors: ValidationError[];
  translations: Record<string, string>;
  setTranslation: (key: string, value: string) => void;
}) {
  const errorCount = (parseError ? 1 : 0) + validationErrors.length;
  const [tab, setTab] = useState<AppTab>('summary');
  const translationCount = Object.keys(translations).length;

  const tabs: { key: AppTab; label: string }[] = [
    { key: 'summary', label: 'Summary' },
    { key: 'validation', label: 'Validation' },
    { key: 'errors', label: `Errors${errorCount > 0 ? ` (${errorCount})` : ''}` },
    { key: 'translations', label: `Translations${translationCount > 0 ? ` (${translationCount})` : ''}` },
  ];

  const navCount =
    compiledApp?.navigation.reduce((n, item) => n + (item.type === 'group' ? (item.children?.length ?? 0) : 1), 0) ?? 0;

  const entitiesWithRules =
    compiledApp?.entities.filter((e) => e.createFields.some((f) => f.effectiveFieldRules.length > 0)) ?? [];
  const totalRules = entitiesWithRules.reduce(
    (sum, e) => sum + e.createFields.reduce((s, f) => s + f.effectiveFieldRules.length, 0),
    0,
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-gray-100 dark:border-gray-700 shrink-0">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 text-[11px] whitespace-nowrap ${
              t.key === 'errors' && errorCount > 0
                ? tab === t.key
                  ? 'border-b-2 border-red-500 text-red-500 font-medium'
                  : 'text-red-500 hover:text-red-600'
                : tab === t.key
                  ? 'border-b-2 border-blue-600 text-blue-600 font-medium dark:border-blue-400 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {tab === 'summary' && !compiledApp && <p className="text-xs text-gray-400">Load a manifest to see summary.</p>}
        {tab === 'summary' && compiledApp && (
          <div className="space-y-3">
            <div className="flex gap-4">
              {[
                { value: compiledApp.entities.length, label: 'Entities' },
                { value: compiledApp.pages.length, label: 'Pages' },
                { value: navCount, label: 'Nav Items' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{value}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Routes</div>
              <div className="space-y-0.5">
                {compiledApp.routes.map((r) => (
                  <div key={r.path} className="flex items-center gap-2">
                    <code className="text-[10px] font-mono text-gray-500 dark:text-gray-400 min-w-0 truncate">
                      {r.path}
                    </code>
                    <span className="text-[10px] text-gray-400 shrink-0">→ {r.pageKey}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {tab === 'validation' && !compiledApp && (
          <p className="text-xs text-gray-400">Load a manifest to see validation rules.</p>
        )}
        {tab === 'validation' && compiledApp && entitiesWithRules.length === 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400">No validation rules defined.</p>
        )}
        {tab === 'validation' && compiledApp && entitiesWithRules.length > 0 && (
          <div>
            <p className="text-[10px] text-gray-400 mb-3">
              {totalRules} rule{totalRules !== 1 ? 's' : ''} across {entitiesWithRules.length} entity
              {entitiesWithRules.length !== 1 ? 'ies' : 'y'}
            </p>
            {entitiesWithRules.map((entity) => (
              <EntityValidationSection key={entity.key} entity={entity} />
            ))}
          </div>
        )}
        {tab === 'errors' && (
          <StatusView
            compiledApp={compiledApp}
            parseError={parseError}
            validationErrors={validationErrors}
            emptyLabel=""
          />
        )}
        {tab === 'translations' && <TranslationsTab translations={translations} setTranslation={setTranslation} />}
      </div>
    </div>
  );
}

// ── Non-app mode panel (Result | Translations tabs) ──────────────────────────

const EMPTY_LABELS: Record<BuilderMode, string> = {
  app: 'Load a manifest to see results.',
  dashboard: 'Paste a PageDefinition to validate.',
  list: 'Paste an EntityDefinition to see the field breakdown.',
  detail: 'Paste an EntityDefinition to see the field breakdown.',
  form: 'Paste an EntityDefinition to validate.',
  'simple-entity': 'Paste an EntityDefinition to see the field breakdown.',
  'nested-entity': 'Paste an EntityDefinition to see the field breakdown.',
  'entity-belongs-to': 'Paste an EntityDefinition to see the field breakdown.',
  'entity-has-many': 'Paste an EntityDefinition to see the field breakdown.',
  'entity-many-to-many': 'Paste an EntityDefinition to see the field breakdown.',
  'entity-polymorphic': 'Paste an EntityDefinition to see the field breakdown.',
  'entity-all-relations': 'Paste an EntityDefinition to see the field breakdown.',
  'computed-expression': 'Paste an EntityDefinition to see the field breakdown.',
  'computed-aggregation': 'Paste an EntityDefinition to see the field breakdown.',
  'computed-conditional': 'Paste an EntityDefinition to see the field breakdown.',
  'computed-all': 'Paste an EntityDefinition to see the field breakdown.',
  'lifecycle-simple': 'Paste an EntityDefinition to see the field breakdown.',
  'lifecycle-guards': 'Paste an EntityDefinition to see the field breakdown.',
  'lifecycle-hooks': 'Paste an EntityDefinition to see the field breakdown.',
  'lifecycle-full': 'Paste an EntityDefinition to see the field breakdown.',
  'events-entity': 'Paste an EntityDefinition to see the field breakdown.',
  'events-lifecycle': 'Paste an EntityDefinition to see the field breakdown.',
  'events-full': 'Paste an EntityDefinition to see the field breakdown.',
  'capabilities-simple': 'Paste an EntityDefinition to see the field breakdown.',
  'capabilities-inputs': 'Paste an EntityDefinition to see the field breakdown.',
  'capabilities-full': 'Paste an EntityDefinition to see the field breakdown.',
  'policies-basic': 'Paste an EntityDefinition to see the policy breakdown.',
  'policies-conditional': 'Paste an EntityDefinition to see the policy breakdown.',
  'policies-field': 'Paste an EntityDefinition to see the policy breakdown.',
  'policies-roles': 'Paste an EntityDefinition to see the policy breakdown.',
  validation: 'Paste rules to validate.',
};

// ── Group card for Groups tab ─────────────────────────────────────────────────

function GroupCard({ group }: { group: FieldDefinition }) {
  const [expanded, setExpanded] = useState(true);
  const children = group.fields ?? [];
  return (
    <div className="rounded-lg border border-blue-100 dark:border-blue-800/40 bg-blue-50/20 dark:bg-blue-900/10 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50/60 dark:hover:bg-blue-900/20 transition-colors text-left"
      >
        <span className="text-[9px] text-blue-400 shrink-0 w-3">{expanded ? '▾' : '▸'}</span>
        {/* Key is source of truth */}
        <code className="text-[11px] font-mono font-semibold text-blue-700 dark:text-blue-300">{group.key}</code>
        <span className="text-[10px] text-gray-400 italic">{group.name}</span>
        {group.system && (
          <Badge variant="outline" className="text-[9px] text-gray-400 border-gray-200 px-1 py-0 leading-none">
            system
          </Badge>
        )}
        <span className="ml-auto text-[9px] text-blue-400">
          {children.length} field{children.length !== 1 ? 's' : ''}
        </span>
      </button>
      {expanded && children.length > 0 && (
        <div className="px-3 pb-2 space-y-1 border-t border-blue-100 dark:border-blue-800/40 pt-1.5">
          {children.map((child) => (
            <div key={child.key} className="flex items-center gap-2">
              {child.type === 'object' ? (
                <>
                  <span className="text-[9px] text-blue-400 w-3">▸</span>
                  <code className="text-[10px] font-mono text-blue-600 dark:text-blue-400">{child.key}</code>
                  <span className="text-[9px] text-gray-400 italic">{child.name}</span>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-mono px-1 py-0 leading-none text-blue-500 border-blue-200"
                  >
                    object
                  </Badge>
                  <span className="text-[9px] text-gray-400 ml-auto">{(child.fields ?? []).length} fields</span>
                </>
              ) : (
                <>
                  <span className="w-3" />
                  <code className="text-[10px] font-mono text-gray-600 dark:text-gray-400">{child.key}</code>
                  <span className="text-[9px] text-gray-400 italic">{child.name}</span>
                  <Badge variant="outline" className="ml-auto text-[9px] font-mono px-1 py-0 leading-none">
                    {child.type}
                  </Badge>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Entity mode panel (Result | Validations | Groups | Translations) ──────────

// ── Computed tab for EntityModePanel ──────────────────────────────────────────

const FORMULA_COLORS: Record<string, string> = {
  expression: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700',
  aggregation:
    'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700',
  conditional:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700',
};

function ComputedTab({ computed }: { computed: ComputedFieldDefinition[] }) {
  if (computed.length === 0) {
    return <p className="text-xs text-gray-400">No computed fields defined.</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-gray-400 mb-3">
        {computed.length} computed field{computed.length !== 1 ? 's' : ''}
      </p>
      {computed.map((cf) => {
        const summary =
          cf.formulaType === 'aggregation'
            ? `${cf.operation}(${cf.field ?? '*'}) from ${cf.relation}${cf.filter ? ` where ${cf.filter}` : ''}`
            : cf.formulaType === 'conditional'
              ? `if ${cf.condition} then ${cf.then} else ${cf.else}`
              : cf.expression;

        return (
          <div
            key={cf.key}
            className="rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 overflow-hidden"
          >
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/60">
              <code className="text-[10px] font-mono text-gray-600 dark:text-gray-400">{cf.key}</code>
              <span className="text-[10px] text-gray-400 italic">{cf.name}</span>
              <Badge variant="outline" className="ml-auto text-[9px] font-mono px-1 py-0 leading-none">
                {cf.type}
              </Badge>
              <Badge
                variant="outline"
                className={`text-[9px] font-medium px-1.5 py-0.5 leading-none ${FORMULA_COLORS[cf.formulaType] ?? ''}`}
              >
                {cf.formulaType}
              </Badge>
            </div>
            <div className="px-3 py-2 space-y-1">
              <code className="text-[10px] font-mono text-gray-700 dark:text-gray-300 block break-all">{summary}</code>
              {cf.dependencies && cf.dependencies.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[9px] uppercase tracking-widest text-gray-400">deps</span>
                  {cf.dependencies.map((d) => (
                    <Badge
                      key={d}
                      variant="outline"
                      className="text-[9px] font-mono px-1 py-0 leading-none text-gray-500"
                    >
                      {d}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Lifecycle tab for EntityModePanel ──────────────────────────────────────────

function LifecycleTab({ lifecycle }: { lifecycle: LifecycleDefinition | undefined }) {
  if (!lifecycle) {
    return <p className="text-xs text-gray-400">No lifecycle defined.</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-gray-400">
        field: <code className="font-mono text-gray-600 dark:text-gray-400">{lifecycle.field}</code>
        {' · '}initial: <code className="font-mono text-gray-600 dark:text-gray-400">{lifecycle.initial}</code>
        {' · '}
        {lifecycle.states.length} states
        {' · '}
        {lifecycle.transitions.length} transition{lifecycle.transitions.length !== 1 ? 's' : ''}
      </p>
      <div className="space-y-1.5">
        {lifecycle.transitions.map((t) => (
          <div
            key={t.key}
            className="rounded border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 px-3 py-2"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <code className="text-[10px] font-mono font-semibold text-gray-700 dark:text-gray-300">{t.key}</code>
              <span className="text-[10px] text-gray-400">
                <code className="font-mono">{t.from}</code>
                {' → '}
                <code className="font-mono">{t.to}</code>
              </span>
              {t.guards && t.guards.length > 0 && (
                <Badge
                  variant="outline"
                  className="text-[9px] px-1 py-0 leading-none text-amber-700 border-amber-200 dark:text-amber-300 dark:border-amber-700"
                >
                  {t.guards.length} guard{t.guards.length !== 1 ? 's' : ''}
                </Badge>
              )}
              {t.hooks && t.hooks.length > 0 && (
                <Badge
                  variant="outline"
                  className="text-[9px] px-1 py-0 leading-none text-purple-700 border-purple-200 dark:text-purple-300 dark:border-purple-700"
                >
                  {t.hooks.length} hook{t.hooks.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Events tab for EntityModePanel ─────────────────────────────────────────────

function EventsTab({ entity, events }: { entity: ManifestPreviewEntity | null; events: EventDefinition | undefined }) {
  if (!entity) return <p className="text-xs text-gray-400">Load an entity to see events.</p>;

  const entityKey = entity.key;
  const createdName = events?.names?.created ?? `entity.${entityKey}.created`;
  const updatedName = events?.names?.updated ?? `entity.${entityKey}.updated`;
  const deletedName = events?.names?.deleted ?? `entity.${entityKey}.deleted`;
  const transitions = entity.lifecycle?.transitions ?? [];
  const relations = entity.relations ?? [];

  const totalEvents = 3 + transitions.length + relations.length;

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-gray-400">
        {totalEvents} event{totalEvents !== 1 ? 's' : ''} will be emitted for this entity
      </p>

      {events && (
        <div className="rounded border border-blue-100 dark:border-blue-800/40 bg-blue-50/20 dark:bg-blue-900/10 px-3 py-2 space-y-1.5">
          <p className="text-[9px] uppercase tracking-widest text-blue-500 dark:text-blue-400 mb-1.5">Configuration</p>
          {events.exclude && events.exclude.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-[9px] uppercase tracking-widest text-gray-400 w-12 shrink-0 pt-0.5">Exclude</span>
              <div className="flex flex-wrap gap-1">
                {events.exclude.map((k) => (
                  <Badge
                    key={k}
                    variant="outline"
                    className="text-[9px] font-mono px-1 py-0 leading-none text-rose-600 border-rose-200 dark:text-rose-400 dark:border-rose-700"
                  >
                    {k}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {events.names && Object.keys(events.names).length > 0 && (
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-1">Name Overrides</span>
              {events.names.created && (
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-gray-400 w-12 shrink-0">created</span>
                  <code className="font-mono text-blue-600 dark:text-blue-400">{events.names.created}</code>
                </div>
              )}
              {events.names.updated && (
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-gray-400 w-12 shrink-0">updated</span>
                  <code className="font-mono text-blue-600 dark:text-blue-400">{events.names.updated}</code>
                </div>
              )}
              {events.names.deleted && (
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-gray-400 w-12 shrink-0">deleted</span>
                  <code className="font-mono text-blue-600 dark:text-blue-400">{events.names.deleted}</code>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-[9px] uppercase tracking-widest text-gray-400">Entity Events</p>
        {[
          { name: createdName, desc: 'Entity created' },
          { name: updatedName, desc: 'Entity updated' },
          { name: deletedName, desc: 'Entity soft-deleted' },
        ].map(({ name, desc }) => (
          <div key={name} className="flex items-center gap-2">
            <code className="text-[10px] font-mono text-gray-600 dark:text-gray-400 truncate flex-1">{name}</code>
            <span className="text-[9px] text-gray-400 shrink-0">{desc}</span>
          </div>
        ))}
      </div>

      {transitions.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[9px] uppercase tracking-widest text-gray-400">Lifecycle Transition Events</p>
          {transitions.map((t) => {
            const name = t.event ?? `entity.${entityKey}.transition.${t.key}`;
            return (
              <div key={t.key} className="flex items-center gap-2">
                <code className="text-[10px] font-mono text-gray-600 dark:text-gray-400 truncate flex-1">{name}</code>
                <span className="text-[9px] text-gray-400 shrink-0">
                  {t.from} → {t.to}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {relations.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[9px] uppercase tracking-widest text-gray-400">Relation Events</p>
          {relations.map((rel) => {
            const name = `entity.${entityKey}.relation.${rel.key}.changed`;
            return (
              <div key={rel.key} className="flex items-center gap-2">
                <code className="text-[10px] font-mono text-gray-600 dark:text-gray-400 truncate flex-1">{name}</code>
                <Badge variant="outline" className="text-[9px] px-1 py-0 leading-none shrink-0">
                  {rel.relation.replace('_', ' ')}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Capabilities tab for EntityModePanel ──────────────────────────────────────

const CAPABILITY_TYPE_COLORS: Record<string, string> = {
  transition: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700',
  mutation:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700',
  workflow:
    'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700',
  export: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700',
  integration: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-700',
};

function CapabilitiesTab({ entity }: { entity: ManifestPreviewEntity | null }) {
  if (!entity) return <p className="text-xs text-gray-400">Load an entity to see capabilities.</p>;
  const caps = entity.capabilities ?? [];
  if (caps.length === 0) return <p className="text-xs text-gray-400">No capabilities defined.</p>;

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-gray-400 mb-3">
        {caps.length} capability{caps.length !== 1 ? 'ies' : ''}
      </p>
      {caps.map((cap: CapabilityDefinition) => {
        const inputCount = cap.inputs?.length ?? 0;
        return (
          <div
            key={cap.key}
            className="rounded border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 px-3 py-2 space-y-1"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <code className="text-[10px] font-mono font-semibold text-gray-700 dark:text-gray-300">{cap.key}</code>
              <Badge
                variant="outline"
                className={`text-[9px] font-medium px-1.5 py-0.5 leading-none ${CAPABILITY_TYPE_COLORS[cap.type] ?? ''}`}
              >
                {cap.type}
              </Badge>
              {cap.confirm && (
                <Badge
                  variant="outline"
                  className="text-[9px] px-1 py-0 leading-none text-orange-600 border-orange-200 dark:text-orange-400 dark:border-orange-700"
                >
                  confirm
                </Badge>
              )}
              {inputCount > 0 && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 leading-none text-gray-500">
                  {inputCount} input{inputCount !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            {cap.description && <p className="text-[10px] text-gray-400 italic">{cap.description}</p>}
          </div>
        );
      })}
    </div>
  );
}

// ── Policies tab for EntityModePanel ──────────────────────────────────────────

function PoliciesTab({
  policies,
  fieldPolicies,
}: {
  policies: EntityPoliciesDefinition | undefined;
  fieldPolicies: FieldPoliciesDefinition | undefined;
}) {
  const actions = ['view', 'create', 'update', 'delete'] as const;
  const hasPolicies = !!policies;
  const hasFieldPolicies = fieldPolicies && Object.keys(fieldPolicies).length > 0;

  if (!hasPolicies && !hasFieldPolicies) {
    return <p className="text-xs text-gray-400">No policies defined.</p>;
  }

  return (
    <div className="space-y-4">
      {hasPolicies && (
        <div>
          <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-2">Action Policies</p>
          <div className="space-y-1.5">
            {actions.map((action) => {
              const policy = policies?.[action];
              if (!policy) return null;
              return (
                <div
                  key={action}
                  className="rounded border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 px-3 py-1.5"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1.5 py-0 leading-none text-gray-500 shrink-0 w-12 justify-center"
                    >
                      {action}
                    </Badge>
                    <code className="text-[10px] font-mono text-blue-600 dark:text-blue-400 flex-1 truncate">
                      {policy.scope}
                    </code>
                  </div>
                  {policy.condition && (
                    <p className="text-[10px] font-mono text-amber-700 dark:text-amber-400 mt-1 break-all">
                      if: {policy.condition}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {hasFieldPolicies && (
        <div>
          <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-2">Field Policies</p>
          <div className="space-y-1.5">
            {Object.entries(fieldPolicies!).map(([fieldKey, fp]) => (
              <div
                key={fieldKey}
                className="rounded border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 px-3 py-1.5"
              >
                <code className="text-[10px] font-mono font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  {fieldKey}
                </code>
                <div className="space-y-0.5">
                  {fp.view && (
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1 py-0 leading-none text-gray-400 w-10 justify-center"
                      >
                        view
                      </Badge>
                      <code className="text-[10px] font-mono text-blue-600 dark:text-blue-400">{fp.view.scope}</code>
                    </div>
                  )}
                  {fp.update && (
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1 py-0 leading-none text-gray-400 w-10 justify-center"
                      >
                        update
                      </Badge>
                      <code className="text-[10px] font-mono text-blue-600 dark:text-blue-400">{fp.update.scope}</code>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Scopes tab for EntityModePanel ────────────────────────────────────────────

function ScopesTab({ entity }: { entity: ManifestPreviewEntity | null }) {
  if (!entity) return <p className="text-xs text-gray-400">Load an entity to see scopes.</p>;
  const scopes = entity.scopeRegistry ?? [];
  if (scopes.length === 0) return <p className="text-xs text-gray-400">No scopes derived.</p>;

  const entityKey = entity.key;
  const transitionKeys = new Set((entity.lifecycle?.transitions ?? []).map((t) => t.key));
  const capabilityScopes = new Map((entity.capabilities ?? []).map((c) => [c.scope ?? `${entityKey}.${c.key}`, c.key]));

  function scopeSource(scope: string): string {
    const suffix = scope.startsWith(`${entityKey}.`) ? scope.slice(entityKey.length + 1) : null;
    if (suffix === 'view' || suffix === 'create' || suffix === 'update' || suffix === 'delete') return 'built-in';
    if (suffix && transitionKeys.has(suffix)) return 'transition';
    if (capabilityScopes.has(scope)) return 'capability';
    return 'custom';
  }

  const SOURCE_COLORS: Record<string, string> = {
    'built-in': 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600',
    transition: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700',
    capability:
      'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700',
    custom:
      'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700',
  };

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-gray-400 mb-3">
        {scopes.length} scope{scopes.length !== 1 ? 's' : ''} derived
      </p>
      {scopes.map((scope) => {
        const source = scopeSource(scope);
        return (
          <div key={scope} className="flex items-center gap-2">
            <code className="text-[10px] font-mono text-gray-700 dark:text-gray-300 flex-1 truncate">{scope}</code>
            <Badge
              variant="outline"
              className={`text-[9px] px-1.5 py-0 leading-none shrink-0 ${SOURCE_COLORS[source] ?? ''}`}
            >
              {source}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}

// ── Roles tab for EntityModePanel ─────────────────────────────────────────────

function RolesTab({ roles }: { roles: RoleDefinition[] }) {
  if (roles.length === 0)
    return (
      <p className="text-xs text-gray-400">
        No roles defined. Roles are declared in spec.roles (use policies-roles mode).
      </p>
    );

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-gray-400 mb-3">
        {roles.length} role{roles.length !== 1 ? 's' : ''}
      </p>
      {roles.map((role) => (
        <div
          key={role.key}
          className="rounded border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 px-3 py-2 space-y-1.5"
        >
          <div className="flex items-center gap-2">
            <code className="text-[10px] font-mono font-semibold text-gray-700 dark:text-gray-300">{role.key}</code>
            {role.name && <span className="text-[10px] text-gray-500 dark:text-gray-400 italic">{role.name}</span>}
          </div>
          {role.description && <p className="text-[10px] text-gray-400 italic">{role.description}</p>}
          <div className="flex flex-wrap gap-1">
            {role.scopes.map((s) => (
              <Badge
                key={s}
                variant="outline"
                className="text-[9px] font-mono px-1.5 py-0 leading-none text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-700"
              >
                {s}
              </Badge>
            ))}
          </div>
          {role.identityMappings && role.identityMappings.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[9px] uppercase tracking-widest text-gray-400 shrink-0">mappings</span>
              {role.identityMappings.map((m) => (
                <Badge
                  key={m}
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 leading-none text-purple-600 border-purple-200 dark:text-purple-400 dark:border-purple-700"
                >
                  {m}
                </Badge>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

type EntityTab =
  | 'result'
  | 'validations'
  | 'groups'
  | 'computed'
  | 'lifecycle'
  | 'events'
  | 'capabilities'
  | 'policies'
  | 'scopes'
  | 'roles'
  | 'translations';

function EntityModePanel({
  compiledApp,
  parseError,
  validationErrors,
  translations,
  setTranslation,
}: {
  compiledApp: ManifestPreviewData | null;
  parseError: string | null;
  validationErrors: ValidationError[];
  translations: Record<string, string>;
  setTranslation: (key: string, value: string) => void;
}) {
  const [tab, setTab] = useState<EntityTab>('result');
  const translationCount = Object.keys(translations).length;

  const entity = compiledApp?.entities[0] ?? null;
  const allFields = entity ? flattenCompiledFields(entity.createFields) : [];
  const totalRules = allFields.reduce((sum, f) => sum + f.effectiveFieldRules.length, 0);
  const groups = entity ? collectTopLevelGroups(entity.fields) : [];
  const computedFields = entity?.computed ?? [];
  const lifecycle = entity?.lifecycle ?? undefined;
  const events = entity?.events ?? undefined;
  const capabilities = entity?.capabilities ?? [];
  const policies = entity?.policies;
  const fieldPolicies = entity?.fieldPolicies;
  const scopeRegistry = entity?.scopeRegistry ?? [];
  const roles = compiledApp?.roles ?? [];

  const hasPolicies = !!policies || (fieldPolicies && Object.keys(fieldPolicies).length > 0);

  const tabs: { key: EntityTab; label: string }[] = [
    { key: 'result', label: 'Result' },
    { key: 'validations', label: `Validations${totalRules > 0 ? ` (${totalRules})` : ''}` },
    { key: 'groups', label: `Groups${groups.length > 0 ? ` (${groups.length})` : ''}` },
    { key: 'computed', label: `Computed${computedFields.length > 0 ? ` (${computedFields.length})` : ''}` },
    { key: 'lifecycle', label: `Lifecycle${lifecycle ? ` (${lifecycle.transitions.length})` : ''}` },
    { key: 'events', label: 'Events' },
    { key: 'capabilities', label: `Capabilities${capabilities.length > 0 ? ` (${capabilities.length})` : ''}` },
    { key: 'policies', label: `Policies${hasPolicies ? ' (✓)' : ''}` },
    { key: 'scopes', label: `Scopes (${scopeRegistry.length})` },
    { key: 'roles', label: `Roles${roles.length > 0 ? ` (${roles.length})` : ''}` },
    { key: 'translations', label: `Translations${translationCount > 0 ? ` (${translationCount})` : ''}` },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-gray-100 dark:border-gray-700 shrink-0">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 text-[11px] whitespace-nowrap ${
              tab === t.key
                ? 'border-b-2 border-blue-600 text-blue-600 font-medium dark:border-blue-400 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {tab === 'result' && (
          <StatusView
            compiledApp={compiledApp}
            parseError={parseError}
            validationErrors={validationErrors}
            emptyLabel="Paste an EntityDefinition to see the field breakdown."
          />
        )}
        {tab === 'validations' && !entity && (
          <p className="text-xs text-gray-400">Load an entity to see validation rules.</p>
        )}
        {tab === 'validations' && entity && totalRules === 0 && (
          <p className="text-xs text-gray-500">No validation rules defined.</p>
        )}
        {tab === 'validations' && entity && totalRules > 0 && (
          <div>
            <p className="text-[10px] text-gray-400 mb-3">
              {totalRules} rule{totalRules !== 1 ? 's' : ''} across{' '}
              {allFields.filter((f) => f.effectiveFieldRules.length > 0).length} field
              {allFields.filter((f) => f.effectiveFieldRules.length > 0).length !== 1 ? 's' : ''}
            </p>
            <FieldRuleRows fields={allFields.filter((f) => f.effectiveFieldRules.length > 0)} />
          </div>
        )}
        {tab === 'groups' && !entity && <p className="text-xs text-gray-400">Load an entity to see groups.</p>}
        {tab === 'groups' && entity && groups.length === 0 && (
          <p className="text-xs text-gray-500">
            No object groups defined. Add{' '}
            <code className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded text-[10px]">type: "object"</code>{' '}
            fields to create groups.
          </p>
        )}
        {tab === 'groups' && entity && groups.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] text-gray-400 mb-3">
              {groups.length} group{groups.length !== 1 ? 's' : ''}
            </p>
            {groups.map((g) => (
              <GroupCard key={g.key} group={g} />
            ))}
          </div>
        )}
        {tab === 'computed' && !entity && (
          <p className="text-xs text-gray-400">Load an entity to see computed fields.</p>
        )}
        {tab === 'computed' && entity && <ComputedTab computed={computedFields} />}
        {tab === 'lifecycle' && !entity && <p className="text-xs text-gray-400">Load an entity to see lifecycle.</p>}
        {tab === 'lifecycle' && entity && <LifecycleTab lifecycle={lifecycle} />}
        {tab === 'events' && <EventsTab entity={entity} events={events} />}
        {tab === 'capabilities' && <CapabilitiesTab entity={entity} />}
        {tab === 'policies' && <PoliciesTab policies={policies} fieldPolicies={fieldPolicies} />}
        {tab === 'scopes' && <ScopesTab entity={entity} />}
        {tab === 'roles' && <RolesTab roles={roles} />}
        {tab === 'translations' && <TranslationsTab translations={translations} setTranslation={setTranslation} />}
      </div>
    </div>
  );
}

// ── Simple mode panel (Result | Translations) for non-entity modes ────────────

type SimpleTab = 'result' | 'translations';

function SimpleModePanel({
  mode,
  compiledApp,
  parseError,
  validationErrors,
  translations,
  setTranslation,
}: {
  mode: BuilderMode;
  compiledApp: ManifestPreviewData | null;
  parseError: string | null;
  validationErrors: ValidationError[];
  translations: Record<string, string>;
  setTranslation: (key: string, value: string) => void;
}) {
  const [tab, setTab] = useState<SimpleTab>('result');
  const translationCount = Object.keys(translations).length;
  const tabs: { key: SimpleTab; label: string }[] = [
    { key: 'result', label: 'Result' },
    { key: 'translations', label: `Translations${translationCount > 0 ? ` (${translationCount})` : ''}` },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-gray-100 dark:border-gray-700 shrink-0">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 text-[11px] whitespace-nowrap ${
              tab === t.key
                ? 'border-b-2 border-blue-600 text-blue-600 font-medium dark:border-blue-400 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {tab === 'result' && (
          <StatusView
            compiledApp={compiledApp}
            parseError={parseError}
            validationErrors={validationErrors}
            emptyLabel={EMPTY_LABELS[mode]}
          />
        )}
        {tab === 'translations' && <TranslationsTab translations={translations} setTranslation={setTranslation} />}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

interface CompilerResultPanelProps {
  mode: BuilderMode;
  manifest: CellManifestV1 | null;
  parseError: string | null;
  validationErrors: ValidationError[];
  translations: Record<string, string>;
  setTranslation: (key: string, value: string) => void;
}

export function CompilerResultPanel({
  mode,
  manifest,
  parseError,
  validationErrors,
  translations,
  setTranslation,
}: CompilerResultPanelProps) {
  const compiledApp = useMemo(() => (manifest ? deriveManifestPreviewData(manifest) : null), [manifest]);
  const hasError = !!(parseError || validationErrors.length > 0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-gray-50 dark:bg-gray-800/50 shrink-0">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Compile Result</span>
        {hasError && (
          <span className="ml-auto text-[10px] font-medium text-red-500">
            {(parseError ? 1 : 0) + validationErrors.length} error
            {(parseError ? 1 : 0) + validationErrors.length !== 1 ? 's' : ''}
          </span>
        )}
        {!hasError && compiledApp && (
          <span className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-green-600 dark:text-green-400">
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="2,7 5,10 11,3" />
            </svg>
            Compiled successfully
          </span>
        )}
      </div>

      {mode === 'app' ? (
        <div className="flex-1 min-h-0 overflow-hidden">
          <AppModePanel
            compiledApp={compiledApp}
            parseError={parseError}
            validationErrors={validationErrors}
            translations={translations}
            setTranslation={setTranslation}
          />
        </div>
      ) : mode === 'simple-entity' ||
        mode === 'nested-entity' ||
        mode === 'entity-belongs-to' ||
        mode === 'entity-has-many' ||
        mode === 'entity-many-to-many' ||
        mode === 'entity-polymorphic' ||
        mode === 'entity-all-relations' ||
        mode === 'computed-expression' ||
        mode === 'computed-aggregation' ||
        mode === 'computed-conditional' ||
        mode === 'computed-all' ||
        mode === 'lifecycle-simple' ||
        mode === 'lifecycle-guards' ||
        mode === 'lifecycle-hooks' ||
        mode === 'lifecycle-full' ||
        mode === 'events-entity' ||
        mode === 'events-lifecycle' ||
        mode === 'events-full' ||
        mode === 'capabilities-simple' ||
        mode === 'capabilities-inputs' ||
        mode === 'capabilities-full' ||
        mode === 'policies-basic' ||
        mode === 'policies-conditional' ||
        mode === 'policies-field' ||
        mode === 'policies-roles' ? (
        <div className="flex-1 min-h-0 overflow-hidden">
          <EntityModePanel
            compiledApp={compiledApp}
            parseError={parseError}
            validationErrors={validationErrors}
            translations={translations}
            setTranslation={setTranslation}
          />
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-hidden">
          <SimpleModePanel
            mode={mode}
            compiledApp={compiledApp}
            parseError={parseError}
            validationErrors={validationErrors}
            translations={translations}
            setTranslation={setTranslation}
          />
        </div>
      )}
    </div>
  );
}
