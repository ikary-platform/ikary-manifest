import type { KpiClusterProps } from './KpiClusterPresentationSchema';

export const KpiClusterExamples: Array<{
  label: string;
  description: string;
  props: KpiClusterProps;
}> = [
  {
    label: 'Revenue snapshot',
    description: 'Four-column layout with trend deltas.',
    props: {
      title: 'This quarter',
      columns: 'auto',
      kpis: [
        {
          label: 'Bookings',
          value: '$4.82M',
          trend: { direction: 'up', value: '+12%', label: 'vs last quarter' },
          tone: 'default',
        },
        {
          label: 'Net new ARR',
          value: '$1.14M',
          trend: { direction: 'up', value: '+8%' },
          tone: 'positive',
        },
        {
          label: 'Gross churn',
          value: '$312k',
          trend: { direction: 'down', value: '−3%', label: 'lower is better' },
          tone: 'default',
        },
        {
          label: 'At-risk accounts',
          value: '9',
          helper: '2 with renewal < 30 days',
          trend: { direction: 'up', value: '+2', label: 'worse' },
          tone: 'warning',
        },
      ],
    },
  },
  {
    label: 'Compact two-up',
    description: 'Pair of KPIs for a narrow column.',
    props: {
      kpis: [
        { label: 'MRR', value: '$182k', trend: { direction: 'up', value: '+4%' }, tone: 'default' },
        { label: 'Logos', value: '412', trend: { direction: 'neutral', value: '0' }, tone: 'default' },
      ],
      columns: '2',
    },
  },
];
