export type BulkCommandBarVariant = 'list' | 'section';

export type BulkCommandBarDensity = 'comfortable' | 'compact';

export type BulkCommandBarScope = 'page' | 'all-results';

export type BulkCommandBarActionVariant = 'default' | 'secondary' | 'destructive';

export type BulkCommandBarConfirmView = {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export type BulkCommandBarResolvedAction = {
  key: string;
  label: string;
  icon?: string;
  variant: BulkCommandBarActionVariant;
  disabled?: boolean;
  loading?: boolean;
  confirm?: BulkCommandBarConfirmView;
  onClick?: () => void;
};

export type BulkCommandBarResolvedUtilityAction = {
  label: string;
  disabled?: boolean;
  onClick?: () => void;
};

export type BulkCommandBarViewProps = {
  variant: BulkCommandBarVariant;
  density: BulkCommandBarDensity;
  selectedCount: number;
  scope: BulkCommandBarScope;
  summaryLabel?: string;
  actions: BulkCommandBarResolvedAction[];
  overflowActions: BulkCommandBarResolvedAction[];
  clearSelectionAction?: BulkCommandBarResolvedUtilityAction;
  selectAllResultsAction?: BulkCommandBarResolvedUtilityAction;
};
