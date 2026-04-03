import { registerPrimitive } from '../../registry/primitiveRegistry';
import { Pagination } from './Pagination';
import { resolvePagination } from './Pagination.resolver';

registerPrimitive('pagination', {
  component: Pagination,
  resolver: resolvePagination,
});
