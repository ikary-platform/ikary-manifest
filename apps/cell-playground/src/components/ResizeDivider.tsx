/**
 * A 4px-wide drag handle used between collapsible panels.
 * Renders a 1px visual line; highlights on hover with the accent colour.
 * Pass `onMouseDown` from the `useResizablePanel` hook.
 */
export function ResizeDivider({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) {
  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        width: '4px',
        flexShrink: 0,
        cursor: 'col-resize',
        background: 'transparent',
        borderLeft: '1px solid hsl(var(--border))',
        transition: 'background 0.1s, border-color 0.1s',
        position: 'relative',
        zIndex: 1,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'hsl(var(--accent))';
        e.currentTarget.style.borderLeftColor = 'hsl(var(--primary, var(--accent)))';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.borderLeftColor = 'hsl(var(--border))';
      }}
    />
  );
}
