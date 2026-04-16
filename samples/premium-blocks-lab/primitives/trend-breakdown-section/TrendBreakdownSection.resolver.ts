import {
  TrendBreakdownSectionPresentationSchema,
  type TrendBreakdownSectionProps,
} from './TrendBreakdownSectionPresentationSchema';

export function resolveTrendBreakdownSection(
  props: TrendBreakdownSectionProps & { __slotContext?: unknown },
): TrendBreakdownSectionProps {
  const { __slotContext, ...rest } = props as Record<string, unknown>;
  return TrendBreakdownSectionPresentationSchema.parse(rest);
}
