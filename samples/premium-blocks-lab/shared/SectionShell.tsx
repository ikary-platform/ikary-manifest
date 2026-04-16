import type { ReactNode } from 'react';

/**
 * Consistent outer padding wrapper used by every block. Gives every section
 * the same horizontal inset and vertical rhythm so adjacent primitives stack
 * like shadcn dashboard-01 sections.
 */
export function SectionShell({
  children,
  as: Tag = 'section',
}: {
  children: ReactNode;
  as?: 'section' | 'div' | 'article';
}) {
  return (
    <Tag className="px-4 pt-4 lg:px-6 lg:pt-6">
      {children}
    </Tag>
  );
}
