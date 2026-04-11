export const AUTHORIZATION_MODULE_OPTIONS = Symbol('AUTHORIZATION_MODULE_OPTIONS');
export const REQUIRE_FEATURE_KEY = 'authorization:require_feature';
export const REQUIRE_DOMAIN_KEY = 'authorization:require_domain';
/** Metadata key set by @RequireQuota — read by LicenseQuotaGuard in the app layer. */
export const REQUIRE_QUOTA_KEY = 'license:require_quota';
