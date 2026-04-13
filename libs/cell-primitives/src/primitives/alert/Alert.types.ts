export type AlertVariant = 'default' | 'destructive';

export type AlertViewProps = {
  variant?: AlertVariant;
  title?: string;
  description?: string;
};
