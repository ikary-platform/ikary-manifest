import { registerPrimitiveVersion } from '@ikary/cell-primitives';
import { FilteredWorkspace } from './FilteredWorkspace';
import { resolveFilteredWorkspace } from './FilteredWorkspace.resolver';

registerPrimitiveVersion(
  'filtered-workspace',
  '1.0.0',
  { component: FilteredWorkspace, resolver: resolveFilteredWorkspace },
  { source: 'custom', label: 'Filtered Workspace', category: 'layout' },
);
