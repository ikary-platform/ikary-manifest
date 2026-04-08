import { registerPrimitive } from '../../registry/primitiveRegistry';
import { PageHeader } from './PageHeader';
import { resolvePageHeader } from './PageHeader.resolver';

registerPrimitive('page-header', {
  component: PageHeader,
  resolver: resolvePageHeader,
});
