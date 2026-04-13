import { useNavigate } from 'react-router-dom';
import { SchemaViewer } from '../features/schema-viewer/schema-viewer';
import {
  LAUNCHPAD_TABS,
  getTileGroupsForTab,
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

export function LaunchpadPage({ tab }: LaunchpadPageProps) {
  const navigate = useNavigate();
  const groups = tab === 'schemas' ? [] : getTileGroupsForTab(tab);
  const widthClass = TAB_WIDTH_CLASS[tab];
  const subtitle =
    tab === 'schemas'
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
        {tab === 'schemas' ? (
          <SchemaViewer />
        ) : (
          <TileGrid groups={groups} onSelect={handleTileSelect} />
        )}
      </div>
    </div>
  );
}
