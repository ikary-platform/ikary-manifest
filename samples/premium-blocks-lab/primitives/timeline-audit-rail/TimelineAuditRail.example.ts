import type { TimelineAuditRailProps } from './TimelineAuditRailPresentationSchema';

export const TimelineAuditRailExamples: Array<{
  label: string;
  description: string;
  props: TimelineAuditRailProps;
}> = [
  {
    label: 'Grouped audit trail',
    description: 'Today/Yesterday grouping with mixed tones.',
    props: {
      density: 'default',
      items: [
        {
          id: '1',
          groupHeading: 'Today',
          timestamp: '14:32',
          title: 'Invoice #INV-4821 issued',
          description: 'Generated from the renewal cycle. Delivered to accounts@montclair.com.',
          actor: 'Alice Moreau',
          actorInitials: 'AM',
          tone: 'positive',
        },
        {
          id: '2',
          groupHeading: 'Today',
          timestamp: '11:12',
          title: 'Account owner changed',
          description: 'Previous: Sam Oduya · New: Pierre J.',
          actor: 'System',
          tone: 'info',
        },
        {
          id: '3',
          groupHeading: 'Yesterday',
          timestamp: '09:01',
          title: 'Renewal risk flag raised',
          description: 'Usage dropped 22% over the trailing 14 days.',
          actor: 'Automation',
          tone: 'warning',
        },
        {
          id: '4',
          groupHeading: 'Yesterday',
          timestamp: '08:44',
          title: 'CSM touchpoint logged',
          actor: 'Priya Raman',
          actorInitials: 'PR',
          tone: 'default',
        },
      ],
    },
  },
  {
    label: 'Empty state',
    description: 'No events yet.',
    props: {
      items: [],
      density: 'default',
    },
  },
];
