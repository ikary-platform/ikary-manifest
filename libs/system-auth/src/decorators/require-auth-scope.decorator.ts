import { SetMetadata } from '@nestjs/common';
import { AUTH_ROUTE_SCOPE_KEY } from '../config/constants';

export type AuthRouteScope = 'TENANT' | 'WORKSPACE';

export const RequireAuthScope = (scope: AuthRouteScope) => SetMetadata(AUTH_ROUTE_SCOPE_KEY, scope);
