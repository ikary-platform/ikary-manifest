import type { ReactNode } from 'react';
import type { SlotBinding } from '@ikary/cell-contract';
import type { SlotContext } from '../shared/slot-context';
import { PrimitiveRenderer } from '../runtime/PrimitiveRenderer';

export interface SlotOutletProps {
  /** The zone name, e.g. "header", "toolbar", "table", "footer". */
  zone: string;
  /** All slotBindings from the page definition. This component filters for its own zone. */
  bindings: SlotBinding[];
  /** Base slot context without zone/mode — those are added per binding. */
  slotContext: Omit<SlotContext, 'slotZone' | 'slotMode'>;
  /** Default zone content rendered when no replace binding is present. */
  children: ReactNode;
}

interface ParsedBinding {
  binding: SlotBinding;
  mode: 'prepend' | 'append' | 'replace';
}

function parseBinding(binding: SlotBinding, zone: string): ParsedBinding | null {
  const slot = binding.slot;
  let effectiveZone = slot;
  let inferredMode: 'prepend' | 'append' | 'replace' = 'replace';

  if (slot.endsWith('.before')) {
    effectiveZone = slot.slice(0, -7);
    inferredMode = 'prepend';
  } else if (slot.endsWith('.after')) {
    effectiveZone = slot.slice(0, -6);
    inferredMode = 'append';
  }

  if (effectiveZone !== zone) return null;

  return { binding, mode: binding.mode ?? inferredMode };
}

/**
 * Wraps a named zone on a page, injecting registered primitives at prepend,
 * append, or replace positions declared via `slotBindings` in the page manifest.
 *
 * Primitives rendered inside a slot receive `__slotContext` merged into their props,
 * providing zone name, mode, page metadata, and optional entity context.
 */
export function SlotOutlet({ zone, bindings, slotContext, children }: SlotOutletProps) {
  const prepends: ParsedBinding[] = [];
  const appends: ParsedBinding[] = [];
  let lastReplace: ParsedBinding | null = null;

  for (const binding of bindings) {
    const parsed = parseBinding(binding, zone);
    if (!parsed) continue;
    if (parsed.mode === 'prepend') prepends.push(parsed);
    else if (parsed.mode === 'append') appends.push(parsed);
    else lastReplace = parsed;
  }

  const body = lastReplace ? (
    <PrimitiveRenderer
      primitive={lastReplace.binding.primitive}
      version={lastReplace.binding.version}
      props={{
        ...(lastReplace.binding.props ?? {}),
        __slotContext: { ...slotContext, slotZone: zone, slotMode: 'replace' } satisfies SlotContext,
      }}
    />
  ) : children;

  return (
    <>
      {prepends.map(({ binding }, i) => (
        <PrimitiveRenderer
          key={`${zone}-pre-${binding.primitive}-${i}`}
          primitive={binding.primitive}
          version={binding.version}
          props={{
            ...(binding.props ?? {}),
            __slotContext: { ...slotContext, slotZone: zone, slotMode: 'prepend' } satisfies SlotContext,
          }}
        />
      ))}
      {body}
      {appends.map(({ binding }, i) => (
        <PrimitiveRenderer
          key={`${zone}-app-${binding.primitive}-${i}`}
          primitive={binding.primitive}
          version={binding.version}
          props={{
            ...(binding.props ?? {}),
            __slotContext: { ...slotContext, slotZone: zone, slotMode: 'append' } satisfies SlotContext,
          }}
        />
      ))}
    </>
  );
}
