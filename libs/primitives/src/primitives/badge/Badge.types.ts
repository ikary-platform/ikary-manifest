export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export type BadgeViewProps = {
  label: string;
  variant?: BadgeVariant;
};
