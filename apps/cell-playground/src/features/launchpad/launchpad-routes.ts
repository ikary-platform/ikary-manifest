import {
  AppWindow,
  ArrowLeftRight,
  Bell,
  BellRing,
  Box,
  Braces,
  ClipboardList,
  Cpu,
  FileText,
  GitBranch,
  GitFork,
  KeyRound,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  LayoutTemplate,
  Link,
  Lock,
  MousePointerClick,
  Network,
  PackageOpen,
  PenLine,
  Radio,
  Shield,
  ShieldCheck,
  Shuffle,
  Sigma,
  SlidersHorizontal,
  Table2,
  Users,
  WandSparkles,
  Workflow,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { BuilderMode } from '../compiler/use-builder-state';

export type LaunchpadTab = 'views' | 'data' | 'runtime' | 'schemas';

export type LaunchpadDestination =
  | { kind: 'studio' }
  | { kind: 'builder'; mode: BuilderMode }
  | { kind: 'runtime'; primitive: string };

export interface LaunchpadBlockDefinition {
  tab: LaunchpadTab;
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  destination: LaunchpadDestination;
  aliases?: string[];
}

export interface LaunchpadTileGroupDefinition {
  label: string;
  tiles: LaunchpadBlockDefinition[];
}

export const LAUNCHPAD_TABS: Array<{ key: LaunchpadTab; label: string }> = [
  { key: 'views', label: 'Views' },
  { key: 'data', label: 'Data' },
  { key: 'schemas', label: 'Core Contract' },
];

const BLOCKS: LaunchpadBlockDefinition[] = [
  // Views
  {
    tab: 'views',
    slug: 'studio',
    title: 'Studio',
    description: 'Conversational Cell generation with live preview',
    icon: WandSparkles,
    destination: { kind: 'studio' },
  },
  {
    tab: 'views',
    slug: 'app',
    title: 'App',
    description: 'Full cell — entities, pages, navigation',
    icon: AppWindow,
    destination: { kind: 'builder', mode: 'app' },
  },
  {
    tab: 'views',
    slug: 'dashboard',
    title: 'Dashboard',
    description: 'Dashboard page definition',
    icon: LayoutDashboard,
    destination: { kind: 'builder', mode: 'dashboard' },
  },
  {
    tab: 'views',
    slug: 'list-page',
    aliases: ['list'],
    title: 'List Page',
    description: 'Entity list and data grid',
    icon: Table2,
    destination: { kind: 'builder', mode: 'list' },
  },
  {
    tab: 'views',
    slug: 'details-page',
    aliases: ['detail-page', 'detail'],
    title: 'Detail Page',
    description: 'Entity detail view',
    icon: FileText,
    destination: { kind: 'builder', mode: 'detail' },
  },
  {
    tab: 'views',
    slug: 'form',
    title: 'Form',
    description: 'Entity create form with field ordering',
    icon: PenLine,
    destination: { kind: 'builder', mode: 'form' },
  },

  // Data
  {
    tab: 'data',
    slug: 'simple-entity',
    title: 'Simple Entity',
    description: 'Flat field structure — no nested objects',
    icon: Box,
    destination: { kind: 'builder', mode: 'simple-entity' },
  },
  {
    tab: 'data',
    slug: 'nested-entity',
    title: 'Nested Entity',
    description: 'Object groups for complex domain models',
    icon: Layers,
    destination: { kind: 'builder', mode: 'nested-entity' },
  },
  {
    tab: 'data',
    slug: 'entity-belongs-to',
    title: 'Belongs To',
    description: 'FK reference to a parent entity',
    icon: Link,
    destination: { kind: 'builder', mode: 'entity-belongs-to' },
  },
  {
    tab: 'data',
    slug: 'entity-has-many',
    title: 'One to Many',
    description: 'Parent with child entity collection',
    icon: GitFork,
    destination: { kind: 'builder', mode: 'entity-has-many' },
  },
  {
    tab: 'data',
    slug: 'entity-many-to-many',
    title: 'Many to Many',
    description: 'Junction table with two FK sides',
    icon: ArrowLeftRight,
    destination: { kind: 'builder', mode: 'entity-many-to-many' },
  },
  {
    tab: 'data',
    slug: 'entity-polymorphic',
    title: 'Polymorphic',
    description: 'Relation to any entity type',
    icon: Shuffle,
    destination: { kind: 'builder', mode: 'entity-polymorphic' },
  },
  {
    tab: 'data',
    slug: 'entity-all-relations',
    title: 'All Relations',
    description: 'All five relation types on one entity',
    icon: Network,
    destination: { kind: 'builder', mode: 'entity-all-relations' },
  },
  {
    tab: 'data',
    slug: 'computed-expression',
    title: 'Expression',
    description: 'Derived values from arithmetic formulas',
    icon: Braces,
    destination: { kind: 'builder', mode: 'computed-expression' },
  },
  {
    tab: 'data',
    slug: 'computed-aggregation',
    title: 'Aggregation',
    description: 'sum, count, avg across related records',
    icon: Sigma,
    destination: { kind: 'builder', mode: 'computed-aggregation' },
  },
  {
    tab: 'data',
    slug: 'computed-conditional',
    title: 'Conditional',
    description: 'Boolean flags from predicate expressions',
    icon: GitBranch,
    destination: { kind: 'builder', mode: 'computed-conditional' },
  },
  {
    tab: 'data',
    slug: 'computed-all',
    title: 'All Types',
    description: 'All three formula types on one entity',
    icon: Cpu,
    destination: { kind: 'builder', mode: 'computed-all' },
  },
  {
    tab: 'data',
    slug: 'lifecycle-simple',
    title: 'Simple',
    description: 'Basic state machine — states and transitions',
    icon: Workflow,
    destination: { kind: 'builder', mode: 'lifecycle-simple' },
  },
  {
    tab: 'data',
    slug: 'lifecycle-guards',
    title: 'Guards',
    description: 'Transitions guarded by precondition expressions',
    icon: Lock,
    destination: { kind: 'builder', mode: 'lifecycle-guards' },
  },
  {
    tab: 'data',
    slug: 'lifecycle-hooks',
    title: 'Hooks',
    description: 'Post-transition side-effect hook names',
    icon: Zap,
    destination: { kind: 'builder', mode: 'lifecycle-hooks' },
  },
  {
    tab: 'data',
    slug: 'lifecycle-full',
    title: 'Full',
    description: 'Labels, guards, hooks, and custom event names',
    icon: LayoutGrid,
    destination: { kind: 'builder', mode: 'lifecycle-full' },
  },
  {
    tab: 'data',
    slug: 'validation',
    title: 'Field Validations',
    description: 'Test field-level validation rules live',
    icon: ShieldCheck,
    destination: { kind: 'builder', mode: 'validation' },
  },
  {
    tab: 'data',
    slug: 'events-entity',
    title: 'Entity Events',
    description: 'Exclude fields + custom event name overrides',
    icon: Bell,
    destination: { kind: 'builder', mode: 'events-entity' },
  },
  {
    tab: 'data',
    slug: 'events-lifecycle',
    title: 'Lifecycle Events',
    description: 'Transition events derived from lifecycle states',
    icon: BellRing,
    destination: { kind: 'builder', mode: 'events-lifecycle' },
  },
  {
    tab: 'data',
    slug: 'events-full',
    title: 'Full Events',
    description: 'All event groups: entity, lifecycle, and relations',
    icon: Radio,
    destination: { kind: 'builder', mode: 'events-full' },
  },
  {
    tab: 'data',
    slug: 'capabilities-simple',
    title: 'Simple',
    description: 'Transition, export, and mutation — no inputs',
    icon: MousePointerClick,
    destination: { kind: 'builder', mode: 'capabilities-simple' },
  },
  {
    tab: 'data',
    slug: 'capabilities-inputs',
    title: 'With Inputs',
    description: 'Action forms with required and optional inputs',
    icon: ClipboardList,
    destination: { kind: 'builder', mode: 'capabilities-inputs' },
  },
  {
    tab: 'data',
    slug: 'capabilities-full',
    title: 'Full',
    description: 'All five capability types on one entity',
    icon: PackageOpen,
    destination: { kind: 'builder', mode: 'capabilities-full' },
  },
  {
    tab: 'data',
    slug: 'policies-basic',
    title: 'Basic',
    description: 'CRUD action policies with scope requirements',
    icon: Shield,
    destination: { kind: 'builder', mode: 'policies-basic' },
  },
  {
    tab: 'data',
    slug: 'policies-conditional',
    title: 'Conditional',
    description: 'Row-level security with condition expressions',
    icon: SlidersHorizontal,
    destination: { kind: 'builder', mode: 'policies-conditional' },
  },
  {
    tab: 'data',
    slug: 'policies-field',
    title: 'Field',
    description: 'Per-field view and update scope restrictions',
    icon: KeyRound,
    destination: { kind: 'builder', mode: 'policies-field' },
  },
  {
    tab: 'data',
    slug: 'policies-roles',
    title: '+ Roles',
    description: 'Roles bundling scopes with identity mappings',
    icon: Users,
    destination: { kind: 'builder', mode: 'policies-roles' },
  },

  // Runtime tab (kept for backward compat — same blocks, legacy routing)

  // shadcn UI primitives

  // Runtime tab (kept for backward compat — same blocks, legacy routing)
  {
    tab: 'runtime',
    slug: 'data-grid',
    aliases: ['data_grid'],
    title: 'Data Grid',
    description: 'Contract-first Data Grid presentation demo',
    icon: Table2,
    destination: { kind: 'runtime', primitive: 'data-grid' },
  },
  {
    tab: 'runtime',
    slug: 'list-page',
    aliases: ['list_page'],
    title: 'List Page',
    description: 'Contract-first List Page presentation demo',
    icon: LayoutTemplate,
    destination: { kind: 'runtime', primitive: 'list-page' },
  },
  {
    tab: 'runtime',
    slug: 'card-list',
    aliases: ['card_list'],
    title: 'Card List',
    description: 'Contract-first Card List presentation demo',
    icon: PackageOpen,
    destination: { kind: 'runtime', primitive: 'card-list' },
  },
  {
    tab: 'runtime',
    slug: 'metric-card',
    aliases: ['metric_card'],
    title: 'Metric Card',
    description: 'Contract-first Metric Card presentation demo',
    icon: Sigma,
    destination: { kind: 'runtime', primitive: 'metric-card' },
  },
  {
    tab: 'runtime',
    slug: 'activity-feed',
    aliases: ['activity_feed'],
    title: 'Activity Feed',
    description: 'Contract-first Activity Feed presentation demo',
    icon: Bell,
    destination: { kind: 'runtime', primitive: 'activity-feed' },
  },
  {
    tab: 'runtime',
    slug: 'pagination',
    title: 'Pagination',
    description: 'Contract-first Pagination presentation demo',
    icon: SlidersHorizontal,
    destination: { kind: 'runtime', primitive: 'pagination' },
  },
  {
    tab: 'runtime',
    slug: 'page-header',
    aliases: ['page_header'],
    title: 'Page Header',
    description: 'Contract-first Page Header presentation demo',
    icon: LayoutTemplate,
    destination: { kind: 'runtime', primitive: 'page-header' },
  },
  {
    tab: 'runtime',
    slug: 'detail-page',
    aliases: ['detail_page'],
    title: 'Detail Page',
    description: 'Contract-first Detail Page presentation demo',
    icon: FileText,
    destination: { kind: 'runtime', primitive: 'detail-page' },
  },
  {
    tab: 'runtime',
    slug: 'dashboard-page',
    aliases: ['dashboard_page'],
    title: 'Dashboard Page',
    description: 'Contract-first Dashboard Page presentation demo',
    icon: LayoutDashboard,
    destination: { kind: 'runtime', primitive: 'dashboard-page' },
  },
  {
    tab: 'runtime',
    slug: 'detail-section',
    aliases: ['detail_section'],
    title: 'Detail Section',
    description: 'Contract-first Detail Section presentation demo',
    icon: ClipboardList,
    destination: { kind: 'runtime', primitive: 'detail-section' },
  },
  {
    tab: 'runtime',
    slug: 'detail-item',
    aliases: ['detail_item'],
    title: 'Detail Item',
    description: 'Contract-first Detail Item presentation demo',
    icon: FileText,
    destination: { kind: 'runtime', primitive: 'detail-item' },
  },
  {
    tab: 'runtime',
    slug: 'empty-state',
    aliases: ['empty_state'],
    title: 'Empty State',
    description: 'Contract-first Empty State presentation demo',
    icon: Box,
    destination: { kind: 'runtime', primitive: 'empty-state' },
  },
  {
    tab: 'runtime',
    slug: 'loading-state',
    aliases: ['loading_state'],
    title: 'Loading State',
    description: 'Contract-first Loading State presentation demo',
    icon: SlidersHorizontal,
    destination: { kind: 'runtime', primitive: 'loading-state' },
  },
  {
    tab: 'runtime',
    slug: 'filter-bar',
    aliases: ['filter_bar'],
    title: 'Filter Bar',
    description: 'Contract-first Filter Bar presentation demo',
    icon: SlidersHorizontal,
    destination: { kind: 'runtime', primitive: 'filter-bar' },
  },
  {
    tab: 'runtime',
    slug: 'bulk-command-bar',
    aliases: ['bulk_command_bar'],
    title: 'Bulk Command Bar',
    description: 'Contract-first Bulk Command Bar presentation demo',
    icon: Zap,
    destination: { kind: 'runtime', primitive: 'bulk-command-bar' },
  },
  {
    tab: 'runtime',
    slug: 'error-state',
    aliases: ['error_state'],
    title: 'Error State',
    description: 'Contract-first Error State presentation demo',
    icon: Shield,
    destination: { kind: 'runtime', primitive: 'error-state' },
  },
  {
    tab: 'runtime',
    slug: 'field-value',
    aliases: ['field_value'],
    title: 'Field Value',
    description: 'Contract-first Field Value presentation demo',
    icon: Braces,
    destination: { kind: 'runtime', primitive: 'field-value' },
  },
  {
    tab: 'runtime',
    slug: 'input',
    title: 'Input',
    description: 'Contract-first Input primitive demo',
    icon: MousePointerClick,
    destination: { kind: 'runtime', primitive: 'input' },
  },
  {
    tab: 'runtime',
    slug: 'textarea',
    title: 'Textarea',
    description: 'Contract-first Textarea primitive demo',
    icon: FileText,
    destination: { kind: 'runtime', primitive: 'textarea' },
  },
  {
    tab: 'runtime',
    slug: 'select',
    title: 'Select',
    description: 'Contract-first Select primitive demo',
    icon: SlidersHorizontal,
    destination: { kind: 'runtime', primitive: 'select' },
  },
  {
    tab: 'runtime',
    slug: 'checkbox',
    title: 'Checkbox',
    description: 'Contract-first Checkbox primitive demo',
    icon: ShieldCheck,
    destination: { kind: 'runtime', primitive: 'checkbox' },
  },
  {
    tab: 'runtime',
    slug: 'radio-group',
    aliases: ['radio_group'],
    title: 'Radio Group',
    description: 'Contract-first RadioGroup primitive demo',
    icon: Radio,
    destination: { kind: 'runtime', primitive: 'radio-group' },
  },
  {
    tab: 'runtime',
    slug: 'toggle',
    title: 'Toggle',
    description: 'Contract-first Toggle primitive demo',
    icon: BellRing,
    destination: { kind: 'runtime', primitive: 'toggle' },
  },
  {
    tab: 'runtime',
    slug: 'date-input',
    aliases: ['date_input'],
    title: 'Date Input',
    description: 'Contract-first DateInput primitive demo',
    icon: ClipboardList,
    destination: { kind: 'runtime', primitive: 'date-input' },
  },
  {
    tab: 'runtime',
    slug: 'form-field',
    aliases: ['form_field'],
    title: 'Form Field',
    description: 'Contract-first Form Field presentation demo',
    icon: PenLine,
    destination: { kind: 'runtime', primitive: 'form-field' },
  },
  {
    tab: 'runtime',
    slug: 'form-section',
    aliases: ['form_section'],
    title: 'Form Section',
    description: 'Contract-first Form Section presentation demo',
    icon: LayoutTemplate,
    destination: { kind: 'runtime', primitive: 'form-section' },
  },
  {
    tab: 'runtime',
    slug: 'form',
    title: 'Form',
    description: 'Contract-first Ikary Form presentation demo',
    icon: PenLine,
    destination: { kind: 'runtime', primitive: 'form' },
  },
  {
    tab: 'runtime',
    slug: 'tabs',
    title: 'Tabs',
    description: 'Contract-first Tabs presentation demo',
    icon: LayoutGrid,
    destination: { kind: 'runtime', primitive: 'tabs' },
  },
];

const GROUP_SPECS: Record<LaunchpadTab, Array<{ label: string; slugs: string[] }>> = {
  views: [
    { label: 'App Shell', slugs: ['studio', 'app'] },
    { label: 'Page Types', slugs: ['dashboard', 'list-page', 'details-page'] },
    { label: 'Form', slugs: ['form'] },
  ],
  data: [
    { label: 'Plain', slugs: ['simple-entity', 'nested-entity'] },
    {
      label: 'Relational',
      slugs: [
        'entity-belongs-to',
        'entity-has-many',
        'entity-many-to-many',
        'entity-polymorphic',
        'entity-all-relations',
      ],
    },
    {
      label: 'Computed',
      slugs: ['computed-expression', 'computed-aggregation', 'computed-conditional', 'computed-all'],
    },
    { label: 'Lifecycle', slugs: ['lifecycle-simple', 'lifecycle-guards', 'lifecycle-hooks', 'lifecycle-full'] },
    { label: 'Validation', slugs: ['validation'] },
    { label: 'Events', slugs: ['events-entity', 'events-lifecycle', 'events-full'] },
    { label: 'Capabilities', slugs: ['capabilities-simple', 'capabilities-inputs', 'capabilities-full'] },
    {
      label: 'Policies & Roles',
      slugs: ['policies-basic', 'policies-conditional', 'policies-field', 'policies-roles'],
    },
  ],
  runtime: [
    {
      label: 'Data',
      slugs: [
        'list-page',
        'data-grid',
        'card-list',
        'metric-card',
        'activity-feed',
        'pagination',
        'page-header',
        'detail-page',
        'dashboard-page',
        'detail-section',
        'detail-item',
        'empty-state',
        'loading-state',
        'filter-bar',
        'bulk-command-bar',
        'error-state',
        'field-value',
        'input',
        'textarea',
        'select',
        'checkbox',
        'radio-group',
        'toggle',
        'date-input',
        'form-field',
        'form-section',
        'form',
        'tabs',
      ],
    },
  ],
  schemas: [],
};

function normalizeSlug(value: string): string {
  return value.trim().toLowerCase();
}

function toBlockLookup(tab: LaunchpadTab): Map<string, LaunchpadBlockDefinition> {
  const map = new Map<string, LaunchpadBlockDefinition>();

  for (const block of BLOCKS.filter((entry) => entry.tab === tab)) {
    const keys = [block.slug, ...(block.aliases ?? [])];
    for (const key of keys) {
      const normalized = normalizeSlug(key);
      if (map.has(normalized)) {
        throw new Error(`Duplicate Launchpad slug alias '${normalized}' for tab '${tab}'.`);
      }
      map.set(normalized, block);
    }
  }

  return map;
}

const LOOKUP_BY_TAB: Record<LaunchpadTab, Map<string, LaunchpadBlockDefinition>> = {
  views: toBlockLookup('views'),
  data: toBlockLookup('data'),
  runtime: toBlockLookup('runtime'),
  schemas: toBlockLookup('schemas'),
};

const BLOCKS_BY_TAB: Record<LaunchpadTab, LaunchpadBlockDefinition[]> = {
  views: BLOCKS.filter((block) => block.tab === 'views'),
  data: BLOCKS.filter((block) => block.tab === 'data'),
  runtime: BLOCKS.filter((block) => block.tab === 'runtime'),
  schemas: BLOCKS.filter((block) => block.tab === 'schemas'),
};

const RUNTIME_BLOCKS_BY_PRIMITIVE = new Map<string, LaunchpadBlockDefinition>(
  BLOCKS_BY_TAB.runtime.flatMap((block): Array<[string, LaunchpadBlockDefinition]> => {
    if (block.destination.kind !== 'runtime') {
      return [];
    }
    return [[block.destination.primitive, block]];
  }),
);


function toGroupTiles(tab: LaunchpadTab): LaunchpadTileGroupDefinition[] {
  const bySlug = new Map(BLOCKS_BY_TAB[tab].map((block) => [block.slug, block]));

  return GROUP_SPECS[tab].map((group) => ({
    label: group.label,
    tiles: group.slugs
      .map((slug) => bySlug.get(slug))
      .filter((value): value is LaunchpadBlockDefinition => Boolean(value)),
  }));
}

const GROUPS_BY_TAB: Record<LaunchpadTab, LaunchpadTileGroupDefinition[]> = {
  views: toGroupTiles('views'),
  data: toGroupTiles('data'),
  runtime: toGroupTiles('runtime'),
  schemas: toGroupTiles('schemas'),
};

export function toTabPath(tab: LaunchpadTab): string {
  return `/${tab}`;
}

export function toBlockPath(tab: LaunchpadTab, slug: string): string {
  return `/${tab}/${slug}`;
}

export function getTileGroupsForTab(tab: LaunchpadTab): LaunchpadTileGroupDefinition[] {
  return GROUPS_BY_TAB[tab];
}

export function resolveBlock(tab: LaunchpadTab, slug: string): LaunchpadBlockDefinition | null {
  return LOOKUP_BY_TAB[tab].get(normalizeSlug(slug)) ?? null;
}

export function resolveLegacyMode(mode: string): string | null {
  const normalizedMode = normalizeSlug(mode);
  const block = BLOCKS.find(
    (entry) => entry.destination.kind === 'builder' && entry.destination.mode === normalizedMode,
  );

  if (!block) {
    return null;
  }

  return toBlockPath(block.tab, block.slug);
}

export function resolveRuntimeSlug(slug: string): { primitive: string; block: LaunchpadBlockDefinition } | null {
  const block = resolveBlock('runtime', slug);
  if (!block || block.destination.kind !== 'runtime') {
    return null;
  }

  return {
    primitive: block.destination.primitive,
    block,
  };
}

export function getRuntimeBlockForPrimitive(primitive: string): LaunchpadBlockDefinition | null {
  return RUNTIME_BLOCKS_BY_PRIMITIVE.get(primitive) ?? null;
}
