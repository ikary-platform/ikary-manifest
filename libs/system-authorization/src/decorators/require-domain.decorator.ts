import { SetMetadata } from '@nestjs/common';
import { REQUIRE_DOMAIN_KEY } from '../config/constants';
import { AccessLevel } from '../interfaces/access-level.enum';

export interface RequiredDomainPermission {
  code: string;
  level: AccessLevel;
}

export const RequireDomain = (code: string, level: AccessLevel = AccessLevel.VIEW) =>
  SetMetadata(REQUIRE_DOMAIN_KEY, { code: code.toUpperCase(), level } satisfies RequiredDomainPermission);
