import type { ReactNode } from 'react';
import type { FieldValuePresentation } from '@ikary-manifest/presentation';
import type {
  FieldValueDateStyle,
  FieldValueLinkTarget,
  FieldValueTone,
  FieldValueViewProps,
} from './FieldValue.types';

export type BuildFieldValueViewModelInput = {
  presentation: FieldValuePresentation;

  /**
   * Final runtime value to display.
   * This is the main live value resolved by the parent primitive or runtime.
   */
  value: unknown;

  /**
   * Optional resolved href for link values.
   */
  href?: string;

  /**
   * Optional runtime click behavior for link-like values.
   * Useful when navigation is action-based instead of plain href-based.
   */
  onClick?: () => void;

  /**
   * Optional runtime render override.
   * Keep for escape hatches only.
   */
  renderOverride?: ReactNode;
};

export function buildFieldValueViewModel(input: BuildFieldValueViewModelInput): FieldValueViewProps {
  return {
    value: input.value,
    valueType: input.presentation.valueType,
    emptyLabel: normalizeEmptyLabel(input.presentation.emptyLabel),
    tone: normalizeTone(input.presentation.tone),
    href: input.href,
    onClick: input.onClick,
    linkTarget: normalizeLinkTarget(input.presentation.link?.target),
    truncate: input.presentation.truncate ?? false,
    tooltip: input.presentation.tooltip ?? false,
    dense: input.presentation.dense ?? false,
    currency: input.presentation.format?.currency,
    dateStyle: normalizeDateStyle(input.presentation.format?.dateStyle),
    datetimeStyle: normalizeDateStyle(input.presentation.format?.datetimeStyle),
    renderOverride: input.renderOverride,
  };
}

function normalizeEmptyLabel(value: string | undefined): string | undefined {
  if (value === undefined) return '—';
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : '—';
}

function normalizeTone(value: string | undefined): FieldValueTone | undefined {
  if (value === 'neutral' || value === 'info' || value === 'success' || value === 'warning' || value === 'danger') {
    return value;
  }

  return undefined;
}

function normalizeLinkTarget(value: string | undefined): FieldValueLinkTarget | undefined {
  if (value === 'internal' || value === 'external') {
    return value;
  }

  return undefined;
}

function normalizeDateStyle(value: string | undefined): FieldValueDateStyle | undefined {
  if (value === 'short' || value === 'medium' || value === 'long') {
    return value;
  }

  return undefined;
}
