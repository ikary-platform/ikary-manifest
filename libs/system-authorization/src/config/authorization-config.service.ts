import { Inject, Injectable } from '@nestjs/common';
import { AUTHORIZATION_MODULE_OPTIONS } from './constants';
import {
  getAllowedScopeTypes,
  getAllowedTargetTypes,
  type AssignmentLevel,
  type AuthorizationMode,
  type AuthorizationModuleOptions,
} from './authorization-options.schema';
import type { ScopeType, TargetType } from '../interfaces/authorization.types';

@Injectable()
export class AuthorizationConfigService {
  constructor(@Inject(AUTHORIZATION_MODULE_OPTIONS) private readonly options: AuthorizationModuleOptions) {}

  get config(): AuthorizationModuleOptions {
    return this.options;
  }

  get mode(): AuthorizationMode {
    return this.options.mode;
  }

  get assignmentLevel(): AssignmentLevel {
    return this.options.assignmentLevel;
  }

  get allowedScopeTypes(): ScopeType[] {
    return getAllowedScopeTypes(this.mode);
  }

  get allowedTargetTypes(): TargetType[] {
    return getAllowedTargetTypes(this.assignmentLevel);
  }

  isScopeTypeAllowed(scopeType: ScopeType): boolean {
    return this.allowedScopeTypes.includes(scopeType);
  }

  isTargetTypeAllowed(targetType: TargetType): boolean {
    return this.allowedTargetTypes.includes(targetType);
  }

  isFeatureModeEnabled(): boolean {
    return this.mode === 'feature' || this.mode === 'both';
  }

  isDomainModeEnabled(): boolean {
    return this.mode === 'domain' || this.mode === 'both';
  }

  includesRoleAssignments(): boolean {
    return this.allowedTargetTypes.includes('ROLE');
  }

  includesGroupAssignments(): boolean {
    return this.allowedTargetTypes.includes('GROUP');
  }
}
