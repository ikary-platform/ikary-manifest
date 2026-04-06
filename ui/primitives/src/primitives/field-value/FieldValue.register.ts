import { registerPrimitive } from '../../registry/primitiveRegistry';
import { FieldValue } from './FieldValue';
import { resolveFieldValue } from './FieldValue.resolver';

registerPrimitive('field-value', {
  component: FieldValue,
  resolver: resolveFieldValue,
});
