import { registerPrimitive } from '../../registry/primitiveRegistry';
import { Tabs } from './Tabs';
import { resolveTabs } from './Tabs.resolver';

registerPrimitive('tabs', {
  component: Tabs,
  resolver: resolveTabs,
});
