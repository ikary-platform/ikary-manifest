import React, { memo } from 'react';
import type { PlatformLogEntry } from '../shared/log-entry.schema';
import { LEVEL_COLORS } from './level-colors';

export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return `${h}:${m}:${s}.${ms}`;
}

export function formatLevel(level: string): string {
  return level.toUpperCase().padEnd(5);
}

interface HighlightedTextProps {
  text: string;
  term: string;
}

function HighlightedText({ text, term }: HighlightedTextProps) {
  if (!term) return <>{text}</>;

  const lowerText = text.toLowerCase();
  const lowerTerm = term.toLowerCase();
  const parts: Array<{ text: string; highlight: boolean }> = [];
  let lastIndex = 0;

  let idx = lowerText.indexOf(lowerTerm, lastIndex);
  while (idx !== -1) {
    if (idx > lastIndex) {
      parts.push({ text: text.slice(lastIndex, idx), highlight: false });
    }
    parts.push({ text: text.slice(idx, idx + term.length), highlight: true });
    lastIndex = idx + term.length;
    idx = lowerText.indexOf(lowerTerm, lastIndex);
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), highlight: false });
  }

  if (parts.length === 0) return <>{text}</>;

  return (
    <>
      {parts.map((p, i) =>
        p.highlight ? (
          <span
            key={i}
            style={{ backgroundColor: 'var(--ux-terminal-selection)', borderRadius: '2px', padding: '0 1px' }}
          >
            {p.text}
          </span>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  );
}

interface TerminalLogLineProps {
  entry: PlatformLogEntry;
  highlightTerm?: string;
}

export const TerminalLogLine = memo(function TerminalLogLine({ entry, highlightTerm }: TerminalLogLineProps) {
  const timestamp = formatTimestamp(entry.loggedAt);
  const levelStr = formatLevel(entry.level);
  const levelColor = LEVEL_COLORS[entry.level] ?? 'var(--ux-terminal-fg)';
  const isFatal = entry.level === 'fatal';

  return (
    <div
      className="terminal-line flex items-baseline px-3 whitespace-nowrap select-text"
      style={isFatal ? { fontWeight: 600 } : undefined}
    >
      <span style={{ color: 'var(--ux-terminal-muted)' }}>[{timestamp}]</span>
      <span className="mx-2" style={{ color: levelColor }}>
        {levelStr}
      </span>
      {entry.service && <span style={{ color: 'var(--ux-terminal-muted)' }}>[{entry.service}]</span>}
      {entry.operation && (
        <span className="ml-1" style={{ color: 'var(--ux-terminal-muted)' }}>
          {entry.operation}
        </span>
      )}
      <span className="mx-1" style={{ color: 'var(--ux-terminal-muted)' }}>
        —
      </span>
      <span className="truncate" style={{ color: 'var(--ux-terminal-fg)' }}>
        {highlightTerm ? <HighlightedText text={entry.message} term={highlightTerm} /> : entry.message}
      </span>
    </div>
  );
});
