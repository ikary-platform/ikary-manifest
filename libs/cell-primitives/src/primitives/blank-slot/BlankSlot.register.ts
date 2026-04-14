import { registerPrimitive } from '../../registry/primitiveRegistry';
import { BlankSlot } from './BlankSlot';

registerPrimitive('blank-slot', BlankSlot, { category: 'layout', label: 'Blank Slot' });
