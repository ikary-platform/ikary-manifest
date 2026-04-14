import { registerPrimitiveVersion } from '@ikary/primitives';
import { MyBanner } from './MyBanner';
import { resolveMyBanner } from './MyBanner.resolver';

registerPrimitiveVersion('my-banner', '1.0.0', {
  component: MyBanner,
  resolver: resolveMyBanner,
  source: 'custom',
  category: 'custom',
  label: 'My Banner',
});
