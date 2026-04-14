/**
 * BlankSlot — a pure composition container.
 *
 * Renders nothing by default. Its purpose is to act as an empty placeholder
 * in a slot zone so that `prepend` and `append` bindings targeting that zone
 * still render correctly around an empty body.
 *
 * Primary use case: set `primitive: blank-slot` on a custom page and use
 * `slotBindings` to populate the `content` zone.
 */
export function BlankSlot() {
  return null;
}
