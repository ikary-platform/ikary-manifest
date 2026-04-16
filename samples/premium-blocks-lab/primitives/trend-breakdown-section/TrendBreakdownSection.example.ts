import type { TrendBreakdownSectionProps } from './TrendBreakdownSectionPresentationSchema';

export const TrendBreakdownSectionExamples: Array<{
  label: string;
  description: string;
  props: TrendBreakdownSectionProps;
}> = [
  {
    label: 'Pipeline by stage',
    description: 'Chart on the left, ranked breakdown on the right.',
    props: {
      title: 'Pipeline by stage',
      subtitle: 'Trailing 4 weeks, weighted by probability.',
      density: 'default',
      breakdownPosition: 'right',
    },
  },
  {
    label: 'Compact',
    description: 'Reduced padding for dense dashboards.',
    props: {
      title: 'Bookings by region',
      density: 'compact',
      breakdownPosition: 'right',
    },
  },
];
