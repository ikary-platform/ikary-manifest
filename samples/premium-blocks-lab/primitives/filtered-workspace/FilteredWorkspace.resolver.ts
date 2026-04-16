import {
  FilteredWorkspacePresentationSchema,
  type FilteredWorkspaceProps,
} from './FilteredWorkspacePresentationSchema';

export function resolveFilteredWorkspace(
  props: FilteredWorkspaceProps & { __slotContext?: unknown },
): FilteredWorkspaceProps {
  const { __slotContext, ...rest } = props as Record<string, unknown>;
  return FilteredWorkspacePresentationSchema.parse(rest);
}
