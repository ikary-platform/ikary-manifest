import type { ReactNode } from 'react';

export type FieldValueType =
  | 'text'
  | 'number'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'badge'
  | 'status'
  | 'enum'
  | 'link';

export type FieldValueTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export type FieldValueLinkTarget = 'internal' | 'external';

export type FieldValueDateStyle = 'short' | 'medium' | 'long';

export type FieldValueViewProps = {
  /**
   * Final runtime value to display.
   * The adapter resolves it before rendering.
   */
  value: unknown;

  /**
   * Canonical display type.
   */
  valueType: FieldValueType;

  /**
   * Final empty label used when the value is empty.
   * Defaults can be resolved in the adapter.
   */
  emptyLabel?: string;

  /**
   * Optional semantic tone for categorical displays.
   */
  tone?: FieldValueTone;

  /**
   * Optional resolved navigation target for link values.
   */
  href?: string;

  /**
   * Optional link target behavior.
   */
  linkTarget?: FieldValueLinkTarget;

  /**
   * Optional click handler for link-like runtime behavior.
   * Useful when runtime navigation is action-based instead of href-based.
   */
  onClick?: () => void;

  /**
   * Optional display hints.
   */
  truncate?: boolean;
  tooltip?: boolean;
  dense?: boolean;

  /**
   * Optional formatting hints already resolved from contract.
   */
  currency?: string;
  dateStyle?: FieldValueDateStyle;
  datetimeStyle?: FieldValueDateStyle;

  /**
   * Optional pre-rendered override.
   * Keep this for runtime escape hatches only, not contract.
   */
  renderOverride?: ReactNode;
};
