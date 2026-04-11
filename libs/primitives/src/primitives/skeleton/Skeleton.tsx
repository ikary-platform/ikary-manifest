import type { SkeletonViewProps } from './Skeleton.types';

export function Skeleton({ count = 1, heightClass = 'h-4', widthClass = 'w-full' }: SkeletonViewProps) {
  const rows = Array.from({ length: count });
  return (
    <div className="flex flex-col gap-2">
      {rows.map((_, index) => (
        <div
          key={index}
          className={['animate-pulse rounded-md bg-muted', heightClass, widthClass].join(' ')}
        />
      ))}
    </div>
  );
}
