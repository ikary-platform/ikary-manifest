import { useState } from 'react';
import { VersionBadge } from './VersionBadge';
import type { PrimitiveCatalogEntry, PrimitiveCatalogGroup } from '../../shared/catalog';
import { groupPrimitivesByCategory } from '../../shared/catalog';

interface PrimitiveSidebarProps {
  entries: PrimitiveCatalogEntry[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
}

export function PrimitiveSidebar({ entries, selectedKey, onSelect }: PrimitiveSidebarProps) {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? entries.filter(
        (e) =>
          e.key.toLowerCase().includes(search.toLowerCase()) ||
          e.label.toLowerCase().includes(search.toLowerCase()),
      )
    : entries;

  const coreEntries = filtered.filter((e) => e.source !== 'custom');
  const customEntries = filtered.filter((e) => e.source === 'custom');

  const coreGroups = groupPrimitivesByCategory(coreEntries);

  return (
    <div
      style={{
        width: '220px',
        flexShrink: 0,
        borderRight: '1px solid hsl(var(--border))',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '12px 12px 8px' }}>
        <input
          type="search"
          placeholder="Search primitives…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '5px 8px',
            fontSize: '12px',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            outline: 'none',
            boxSizing: 'border-box',
            backgroundColor: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
          }}
        />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 16px' }}>
        {coreGroups.map((group) => (
          <SidebarGroup
            key={group.category}
            group={group}
            selectedKey={selectedKey}
            onSelect={onSelect}
          />
        ))}

        {customEntries.length > 0 && (
          <SidebarGroup
            group={{ category: 'custom', label: 'Custom', entries: customEntries }}
            selectedKey={selectedKey}
            onSelect={onSelect}
          />
        )}

        {filtered.length === 0 && (
          <div
            style={{
              padding: '12px',
              fontSize: '12px',
              color: 'hsl(var(--muted-foreground))',
              textAlign: 'center',
            }}
          >
            No primitives found
          </div>
        )}
      </div>
    </div>
  );
}

interface SidebarGroupProps {
  group: PrimitiveCatalogGroup;
  selectedKey: string | null;
  onSelect: (key: string) => void;
}

function SidebarGroup({ group, selectedKey, onSelect }: SidebarGroupProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (group.entries.length === 0) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          width: '100%',
          padding: '6px 12px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'hsl(var(--muted-foreground))',
        }}
      >
        <span style={{ fontSize: '8px' }}>{collapsed ? '▶' : '▼'}</span>
        {group.label}
      </button>

      {!collapsed &&
        group.entries.map((entry) => (
          <SidebarItem
            key={entry.key}
            entry={entry}
            isSelected={selectedKey === entry.key}
            onSelect={() => onSelect(entry.key)}
          />
        ))}
    </div>
  );
}

interface SidebarItemProps {
  entry: PrimitiveCatalogEntry;
  isSelected: boolean;
  onSelect: () => void;
}

function SidebarItem({ entry, isSelected, onSelect }: SidebarItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '6px',
        width: '100%',
        padding: '5px 12px 5px 20px',
        background: isSelected ? 'hsl(var(--accent))' : 'transparent',
        border: 'none',
        borderLeft: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
        cursor: 'pointer',
        fontSize: '12px',
        color: isSelected ? 'hsl(var(--accent-foreground))' : 'hsl(var(--foreground))',
        textAlign: 'left',
      }}
    >
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {entry.label}
      </span>
      <VersionBadge version={entry.version} source={entry.source} />
    </button>
  );
}
