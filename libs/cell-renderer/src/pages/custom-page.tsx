import type { CellPageRendererProps } from '../registry/cell-component-registry';
import { SlotOutlet, PrimitiveRenderer } from '@ikary/cell-primitives';
import type { SlotContext } from '@ikary/cell-primitives';

export function CustomPage({ page }: CellPageRendererProps) {
  const slotBindings = page.slotBindings ?? [];
  const baseSlotCtx: Omit<SlotContext, 'slotZone' | 'slotMode'> = {
    pageType: 'custom',
    pageTitle: page.title,
    pageKey: page.key,
  };

  if (page.primitive) {
    return (
      <SlotOutlet zone="content" bindings={slotBindings} slotContext={baseSlotCtx}>
        <PrimitiveRenderer primitive={page.primitive} props={page.options ?? {}} />
      </SlotOutlet>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">{page.title}</h1>
      <SlotOutlet zone="content" bindings={slotBindings} slotContext={baseSlotCtx}>
        <div className="border border-border rounded p-8 text-center text-muted-foreground">
          <p className="text-sm font-medium">Custom page not yet implemented</p>
          <p className="text-xs mt-1 text-muted-foreground">
            Register a custom renderer for key "{page.key}" to display content here. Or set{' '}
            <code className="font-mono">primitive</code> in the page definition.
          </p>
        </div>
      </SlotOutlet>
    </div>
  );
}
