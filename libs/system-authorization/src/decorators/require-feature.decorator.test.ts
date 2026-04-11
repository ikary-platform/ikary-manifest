import { describe, expect, it } from 'vitest';
import { RequireFeature } from './require-feature.decorator';
import { REQUIRE_FEATURE_KEY } from '../config/constants';
import { AccessLevel } from '../interfaces/access-level.enum';

describe('RequireFeature', () => {
  it('sets metadata with uppercased code and the given level', () => {
    const decorator = RequireFeature('billing', AccessLevel.EDIT);

    // SetMetadata returns a decorator that sets Reflect metadata.
    // Apply it to a dummy class to read the metadata back.
    @decorator
    class DummyController {}

    const metadata = Reflect.getMetadata(REQUIRE_FEATURE_KEY, DummyController);
    expect(metadata).toEqual({ code: 'BILLING', level: AccessLevel.EDIT });
  });

  it('defaults to AccessLevel.VIEW when level is omitted', () => {
    const decorator = RequireFeature('reports');

    @decorator
    class DummyController {}

    const metadata = Reflect.getMetadata(REQUIRE_FEATURE_KEY, DummyController);
    expect(metadata).toEqual({ code: 'REPORTS', level: AccessLevel.VIEW });
  });

  it('uppercases mixed-case codes', () => {
    const decorator = RequireFeature('WorkspaceCreate', AccessLevel.ALL);

    @decorator
    class DummyController {}

    const metadata = Reflect.getMetadata(REQUIRE_FEATURE_KEY, DummyController);
    expect(metadata).toEqual({ code: 'WORKSPACECREATE', level: AccessLevel.ALL });
  });
});
