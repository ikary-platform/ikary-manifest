import type { RuntimeContext } from '../../registry/resolverRegistry';
import type { EntityClient } from '../shared/client';
import { fakeEntityClient } from './fakeEntityClient';
import { httpEntityClient } from './httpEntityClient';

export function getEntityClient(context: RuntimeContext): EntityClient {
  if (context.transportMode === 'http') return httpEntityClient;
  return fakeEntityClient;
}

export { fakeEntityClient, httpEntityClient };
