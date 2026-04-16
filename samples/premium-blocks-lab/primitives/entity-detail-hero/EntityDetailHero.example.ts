import type { EntityDetailHeroProps } from './EntityDetailHeroPresentationSchema';

export const EntityDetailHeroExamples: Array<{
  label: string;
  description: string;
  props: EntityDetailHeroProps;
}> = [
  {
    label: 'Active enterprise account',
    description: 'Healthy account with renewal context.',
    props: {
      name: 'Montclair Industries',
      subtitle: 'Enterprise · Industrial manufacturing · 2,400 employees',
      avatarFallback: 'MI',
      status: { label: 'Active', tone: 'positive' },
    },
  },
  {
    label: 'At-risk account',
    description: 'Warning tone with renewal soon.',
    props: {
      name: 'Orbit Labs',
      subtitle: 'Growth · SaaS · Renewal in 14 days',
      avatarFallback: 'OL',
      status: { label: 'Renewal risk', tone: 'warning' },
    },
  },
];
