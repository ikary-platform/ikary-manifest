import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { listPrimitives } from '@ikary/cell-runtime-ui';
import '@ikary/cell-runtime-ui/registry';
import { Box, Cpu, FileText, LayoutTemplate, PenLine, SlidersHorizontal, Table2, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SchemaViewer } from '../features/schema-viewer/schema-viewer';
import {
  LAUNCHPAD_TABS,
  getTileGroupsForTab,
  getRuntimeBlockForPrimitive,
  getRuntimePathForPrimitive,
  toBlockPath,
  toTabPath,
  type LaunchpadBlockDefinition,
  type LaunchpadTab,
} from '../features/launchpad/launchpad-routes';

interface LaunchpadPageProps {
  tab: LaunchpadTab;
}

const TAB_WIDTH_CLASS: Record<LaunchpadTab, string> = {
  views: 'max-w-[1200px]',
  data: 'max-w-[1200px]',
  runtime: 'max-w-[1200px]',
  primitives: 'max-w-[1200px]',
  schemas: 'max-w-[1200px]',
};

function TileGrid({
  groups,
  onSelect,
}: {
  groups: ReturnType<typeof getTileGroupsForTab>;
  onSelect: (tile: LaunchpadBlockDefinition) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      {groups.map(({ label, tiles }) => (
        <div key={label}>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
            {label}
          </p>
          <div className="flex gap-3 flex-wrap">
            {tiles.map((tile) => (
              <button
                key={`${tile.tab}:${tile.slug}`}
                onClick={() => onSelect(tile)}
                className="flex flex-col items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer text-left w-[168px]"
              >
                <tile.icon size={20} className="text-gray-400 dark:text-gray-500 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-tight mb-1">
                    {tile.title}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">{tile.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PrimitiveList() {
  const navigate = useNavigate();
  const runtimeRootPath = toTabPath('primitives');
  const primitives = useMemo(
    () =>
      listPrimitives()
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );
  const primitiveCards = useMemo(
    () =>
      primitives.map((primitive) => {
        const runtimeBlock = getRuntimeBlockForPrimitive(primitive.name);
        const runtimeDemoPath = getRuntimePathForPrimitive(primitive.name);
        const hasRuntimeDemo = runtimeDemoPath !== runtimeRootPath;
        const fallbackTitle = toPrimitiveTitle(primitive.name);

        return {
          name: primitive.name,
          isController: primitive.isController,
          icon: runtimeBlock?.icon ?? getFallbackPrimitiveIcon(primitive.name, Boolean(primitive.isController)),
          title: runtimeBlock?.title ?? fallbackTitle,
          description:
            runtimeBlock?.description ??
            getFallbackPrimitiveDescription(fallbackTitle, Boolean(primitive.isController)),
          hasRuntimeDemo,
          runtimeDemoPath,
        };
      }),
    [primitives, runtimeRootPath],
  );

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
        Registered Runtime Primitives ({primitiveCards.length})
      </p>
      <div className="flex gap-3 flex-wrap">
        {primitiveCards.map((primitive) => (
          <button
            key={primitive.name}
            type="button"
            disabled={!primitive.hasRuntimeDemo}
            onClick={() => primitive.hasRuntimeDemo && navigate(primitive.runtimeDemoPath)}
            className={`flex flex-col items-start gap-3 p-4 rounded-lg border bg-white dark:bg-gray-800 text-left w-[168px] transition-all ${
              primitive.hasRuntimeDemo
                ? 'border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-sm cursor-pointer'
                : 'border-gray-200 dark:border-gray-700 cursor-default'
            }`}
          >
            <primitive.icon size={20} className="text-gray-400 dark:text-gray-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-tight mb-1">
                {primitive.title}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight mb-2">{primitive.description}</p>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[9px] text-gray-500 dark:text-gray-400">{primitive.name}</span>
                {primitive.isController && (
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-violet-500 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-1.5 py-0.5 rounded">
                    controller
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function toPrimitiveTitle(primitiveName: string): string {
  return primitiveName
    .split('-')
    .filter(Boolean)
    .map((segment) => (segment[0] ? `${segment[0].toUpperCase()}${segment.slice(1)}` : segment))
    .join(' ');
}

function getFallbackPrimitiveDescription(title: string, isController: boolean): string {
  if (isController) {
    return `Runtime controller for ${title.toLowerCase()} orchestration`;
  }

  return `Runtime primitive for ${title.toLowerCase()} rendering`;
}

function getFallbackPrimitiveIcon(primitiveName: string, isController: boolean): LucideIcon {
  if (isController) {
    return Cpu;
  }

  const normalized = primitiveName.toLowerCase();

  if (normalized.includes('page')) {
    return LayoutTemplate;
  }

  if (normalized.includes('grid') || normalized.includes('table') || normalized.includes('list')) {
    return Table2;
  }

  if (
    normalized.includes('form') ||
    normalized.includes('field') ||
    normalized.includes('input') ||
    normalized.includes('select') ||
    normalized.includes('checkbox') ||
    normalized.includes('radio') ||
    normalized.includes('toggle') ||
    normalized.includes('date')
  ) {
    return PenLine;
  }

  if (normalized.includes('detail') || normalized.includes('header')) {
    return FileText;
  }

  if (
    normalized.includes('state') ||
    normalized.includes('filter') ||
    normalized.includes('tab') ||
    normalized.includes('pagination')
  ) {
    return SlidersHorizontal;
  }

  if (normalized.includes('action') || normalized.includes('command')) {
    return Zap;
  }

  return Box;
}

export function LaunchpadPage({ tab }: LaunchpadPageProps) {
  const navigate = useNavigate();
  const groups = tab === 'primitives' || tab === 'schemas' ? [] : getTileGroupsForTab(tab);
  const widthClass = TAB_WIDTH_CLASS[tab];
  const subtitle =
    tab === 'primitives'
      ? 'Inspect all registered runtime primitives'
      : tab === 'schemas'
        ? 'Inspect schema contracts, references, Zod-derived JSON schema, and detailed example payloads'
        : 'Select a primitive to start building';

  function handleTileSelect(tile: LaunchpadBlockDefinition) {
    navigate(toBlockPath(tile.tab, tile.slug));
  }

  return (
    <div className="flex flex-col items-center h-full bg-white dark:bg-gray-900 overflow-y-auto">
      <div className={`w-full ${widthClass} px-8 pt-8 pb-0`}>
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Cell Playground</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {LAUNCHPAD_TABS.map((tabItem) => (
            <button
              key={tabItem.key}
              onClick={() => navigate(toTabPath(tabItem.key))}
              className={`px-5 py-2.5 text-sm font-medium transition-colors ${
                tab === tabItem.key
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {tabItem.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`w-full ${widthClass} px-8 py-8`}>
        {tab === 'primitives' ? (
          <PrimitiveList />
        ) : tab === 'schemas' ? (
          <SchemaViewer />
        ) : (
          <TileGrid groups={groups} onSelect={handleTileSelect} />
        )}
      </div>
    </div>
  );
}
