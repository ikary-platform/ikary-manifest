import { registerPrimitiveVersion } from '@ikary/primitives';
import { MyBanner2 } from './MyBanner2';
import { resolveMyBanner2 } from './MyBanner2.resolver';

registerPrimitiveVersion('my-banner2', '1.0.0', {
  component: MyBanner2,
  resolver: resolveMyBanner2,
  source: 'custom',
  category: 'custom',
  label: 'My Banner2',
});
