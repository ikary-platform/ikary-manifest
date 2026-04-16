import type { FilteredWorkspaceProps } from './FilteredWorkspacePresentationSchema';

export const FilteredWorkspaceExamples: Array<{
  label: string;
  description: string;
  props: FilteredWorkspaceProps;
}> = [
  {
    label: 'Active results',
    description: 'Filter chips + result list + aside.',
    props: {
      title: 'Pipeline',
      resultCount: 42,
      asidePosition: 'right',
      isEmpty: false,
      isLoading: false,
    },
  },
  {
    label: 'Empty state',
    description: 'Default empty slot with suggestion copy.',
    props: {
      title: 'Pipeline',
      resultCount: 0,
      isEmpty: true,
      isLoading: false,
      asidePosition: 'right',
    },
  },
  {
    label: 'Loading',
    description: 'Skeleton loader while fetching.',
    props: {
      title: 'Pipeline',
      isLoading: true,
      asidePosition: 'right',
      isEmpty: false,
    },
  },
];
