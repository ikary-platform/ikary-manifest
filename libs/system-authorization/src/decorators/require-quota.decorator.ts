import { SetMetadata } from '@nestjs/common';
import { REQUIRE_QUOTA_KEY } from '../config/constants';

/**
 * The quota resource types that can be enforced at the route level.
 * Declared here so domain packages can import from @ikary/system-authorization
 * without creating a cross-domain dependency on @ikary/domain-license.
 */
export type LicenseQuotaResource = 'cell' | 'workspace' | 'user';

/**
 * Marks a route handler as requiring a license quota check for the given resource.
 * The LicenseQuotaGuard (app layer) reads this metadata via Reflector and calls
 * LicenseService.assertLimit(tenantId, resource) before allowing the request through.
 *
 * @example
 * @Post()
 * @RequireQuota('cell')
 * async create(...) { ... }
 */
export const RequireQuota = (resource: LicenseQuotaResource) => SetMetadata(REQUIRE_QUOTA_KEY, resource);
