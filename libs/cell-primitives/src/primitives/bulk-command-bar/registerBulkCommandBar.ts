import { registerPrimitive } from '../../registry/primitiveRegistry';
import type { PrimitiveResolver } from '../../types/PrimitiveTypes';
import { BulkCommandBar } from './BulkCommandBar';
import { resolveBulkCommandBar, type BulkCommandBarResolverRuntime } from './BulkCommandBar.resolver';
import type { BulkCommandBarViewProps } from './BulkCommandBar.types';

const bulkCommandBarResolver: PrimitiveResolver<unknown, BulkCommandBarViewProps, BulkCommandBarResolverRuntime> = (
  presentation,
  runtime,
) => resolveBulkCommandBar(presentation, runtime);

export function registerBulkCommandBar(): void {
  registerPrimitive('bulk-command-bar', {
    component: BulkCommandBar,
    resolver: bulkCommandBarResolver,
  });
}

registerBulkCommandBar();
