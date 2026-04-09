import React from 'react';
import type { ReactNode, RefObject } from 'react';

export interface TerminalShellProps {
  children: ReactNode;
  bottomBar?: ReactNode;
  className?: string;
  scrollRef?: RefObject<HTMLDivElement | null>;
}

export function TerminalShell({ children, bottomBar, className, scrollRef }: TerminalShellProps) {
  const classes = ['flex', 'flex-col', 'overflow-hidden', 'rounded-lg', 'border', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      style={{
        backgroundColor: 'var(--ux-terminal-bg)',
        color: 'var(--ux-terminal-fg)',
        borderColor: 'var(--ux-terminal-border)',
        fontFamily: 'var(--font-mono)',
      }}
    >
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 text-xs leading-6">
        {children}
      </div>
      {bottomBar && (
        <div className="flex-shrink-0 border-t px-3 py-2" style={{ borderColor: 'var(--ux-terminal-border)' }}>
          {bottomBar}
        </div>
      )}
    </div>
  );
}
