export type AvatarSize = 'sm' | 'md' | 'lg';

export type AvatarViewProps = {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: AvatarSize;
};
