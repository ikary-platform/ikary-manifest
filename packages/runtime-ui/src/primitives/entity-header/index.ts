import { registerPrimitive } from '../../registry/primitiveRegistry';
import { registerResolver } from '../../registry/resolverRegistry';
import { EntityHeader } from './EntityHeader';
import { entityHeaderResolver } from './resolver';

registerPrimitive('entity_header', EntityHeader);
registerResolver('entity_header', entityHeaderResolver);
