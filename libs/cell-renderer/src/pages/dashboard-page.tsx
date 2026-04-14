import type { CellPageRendererProps } from '../registry/cell-component-registry';
import { SlotOutlet } from '@ikary/cell-primitives';
import type { SlotContext } from '@ikary/cell-primitives';

export function DashboardPage({ page }: CellPageRendererProps) {
  const slotBindings = page.slotBindings ?? [];
  const baseSlotCtx: Omit<SlotContext, 'slotZone' | 'slotMode'> = {
    pageType: 'dashboard',
    pageTitle: page.title,
    pageKey: page.key,
  };

  return (
    <div className="flex flex-col h-full">
      <SlotOutlet zone="header" bindings={slotBindings} slotContext={baseSlotCtx}>
        {null}
      </SlotOutlet>
      <SlotOutlet zone="content" bindings={slotBindings} slotContext={baseSlotCtx}>
        <div className="p-6">
          <h1 className="text-xl font-semibold mb-4">{page.title}</h1>
          <div className="border border-border rounded p-8 text-center text-muted-foreground">
            <p className="text-sm">Dashboard content placeholder</p>
            <p className="text-xs mt-1 text-muted-foreground">Connect a real data source to populate this dashboard.</p>
          </div>
        </div>
      </SlotOutlet>
      <SlotOutlet zone="footer" bindings={slotBindings} slotContext={baseSlotCtx}>
        {null}
      </SlotOutlet>
    </div>
  );
}
