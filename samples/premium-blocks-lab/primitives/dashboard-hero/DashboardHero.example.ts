import type { DashboardHeroProps } from './DashboardHeroPresentationSchema';

export const DashboardHeroExamples: Array<{
  label: string;
  description: string;
  props: DashboardHeroProps;
}> = [
  {
    label: 'Revenue overview (emphasis)',
    description: 'Quarterly revenue header with KPI meta strip.',
    props: {
      eyebrow: 'Revenue overview',
      title: 'Q4 pipeline, forecast, and realized revenue',
      subtitle:
        'Track bookings, active renewals, and pipeline health across the Enterprise North region.',
      tone: 'emphasis',
      meta: [
        { label: 'Period', value: 'Q4 2026' },
        { label: 'Owner', value: 'Pierre' },
        { label: 'Region', value: 'Enterprise North' },
        { label: 'Updated', value: '14 min ago' },
      ],
    },
  },
  {
    label: 'Simple default',
    description: 'Minimal variant without meta strip.',
    props: {
      title: 'Account health',
      subtitle: 'At-a-glance signals across every paying customer.',
      tone: 'default',
    },
  },
  {
    label: 'Subtle surface',
    description: 'Low-emphasis hero for secondary screens.',
    props: {
      eyebrow: 'Operations',
      title: 'Invoicing activity',
      tone: 'subtle',
      meta: [
        { label: 'Open invoices', value: '127' },
        { label: 'Overdue', value: '9' },
      ],
    },
  },
];
