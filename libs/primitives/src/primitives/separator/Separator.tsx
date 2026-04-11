import type { SeparatorViewProps } from './Separator.types';

export function Separator({ orientation = 'horizontal', decorative = true }: SeparatorViewProps) {
  const isHorizontal = orientation === 'horizontal';
  return (
    <div
      role={decorative ? 'none' : 'separator'}
      aria-hidden={decorative ? 'true' : undefined}
      aria-orientation={!decorative ? orientation : undefined}
      className={[
        'shrink-0 bg-border',
        isHorizontal ? 'h-[1px] w-full' : 'h-full w-[1px]',
      ].join(' ')}
    />
  );
}
