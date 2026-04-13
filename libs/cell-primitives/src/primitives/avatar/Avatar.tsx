import { useState } from 'react';
import type { AvatarViewProps, AvatarSize } from './Avatar.types';

export function Avatar({ src, alt, fallback, size = 'md' }: AvatarViewProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const showFallback = !src || imgFailed;

  return (
    <span className={['relative flex shrink-0 overflow-hidden rounded-full', sizeCn(size)].join(' ')}>
      {!showFallback ? (
        <img
          src={src}
          alt={alt ?? fallback ?? ''}
          onError={() => setImgFailed(true)}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
          {fallback ?? '?'}
        </span>
      )}
    </span>
  );
}

function sizeCn(size: AvatarSize): string {
  switch (size) {
    case 'sm':
      return 'h-8 w-8';
    case 'lg':
      return 'h-14 w-14';
    default:
      return 'h-10 w-10';
  }
}
