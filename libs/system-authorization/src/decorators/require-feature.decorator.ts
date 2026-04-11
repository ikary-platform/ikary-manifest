import { SetMetadata } from '@nestjs/common';
import { REQUIRE_FEATURE_KEY } from '../config/constants';
import { AccessLevel } from '../interfaces/access-level.enum';

export interface RequiredFeaturePermission {
  code: string;
  level: AccessLevel;
}

export const RequireFeature = (code: string, level: AccessLevel = AccessLevel.VIEW) =>
  SetMetadata(REQUIRE_FEATURE_KEY, { code: code.toUpperCase(), level } satisfies RequiredFeaturePermission);
