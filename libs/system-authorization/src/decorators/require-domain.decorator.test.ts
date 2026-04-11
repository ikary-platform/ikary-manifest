import { describe, expect, it } from 'vitest';
import { RequireDomain } from './require-domain.decorator';
import { REQUIRE_DOMAIN_KEY } from '../config/constants';
import { AccessLevel } from '../interfaces/access-level.enum';

describe('RequireDomain', () => {
  it('sets metadata with uppercased code and the given level', () => {
    const decorator = RequireDomain('users', AccessLevel.EDIT);

    @decorator
    class DummyController {}

    const metadata = Reflect.getMetadata(REQUIRE_DOMAIN_KEY, DummyController);
    expect(metadata).toEqual({ code: 'USERS', level: AccessLevel.EDIT });
  });

  it('defaults to AccessLevel.VIEW when level is omitted', () => {
    const decorator = RequireDomain('orders');

    @decorator
    class DummyController {}

    const metadata = Reflect.getMetadata(REQUIRE_DOMAIN_KEY, DummyController);
    expect(metadata).toEqual({ code: 'ORDERS', level: AccessLevel.VIEW });
  });

  it('uppercases mixed-case codes', () => {
    const decorator = RequireDomain('TenantAccess', AccessLevel.ADMIN);

    @decorator
    class DummyController {}

    const metadata = Reflect.getMetadata(REQUIRE_DOMAIN_KEY, DummyController);
    expect(metadata).toEqual({ code: 'TENANTACCESS', level: AccessLevel.ADMIN });
  });
});
