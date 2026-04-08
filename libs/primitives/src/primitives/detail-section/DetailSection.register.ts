import { registerPrimitive } from '../../registry/primitiveRegistry';
import { DetailSection } from './DetailSection';
import { resolveDetailSection } from './DetailSection.resolver';

registerPrimitive('detail-section', {
  component: DetailSection,
  resolver: resolveDetailSection,
});
