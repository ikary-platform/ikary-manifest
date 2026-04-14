import { registerPrimitive } from '../../registry/primitiveRegistry';
import { SlotDemoBanner } from './SlotDemoBanner';

registerPrimitive('slot-demo-banner', SlotDemoBanner, {
  category: 'layout',
  label: 'Slot Demo Banner',
});
