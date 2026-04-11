import { Inject, Injectable } from '@nestjs/common';
import { AUTH_MODULE_OPTIONS } from './constants';
import { type AuthModuleOptions } from './auth-options.schema';

@Injectable()
export class AuthConfigService {
  constructor(@Inject(AUTH_MODULE_OPTIONS) private readonly options: AuthModuleOptions) {}

  get config(): AuthModuleOptions {
    return this.options;
  }
}
