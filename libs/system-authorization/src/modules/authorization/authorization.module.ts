import { DynamicModule, Global, Module, type Provider } from '@nestjs/common';
import {
  authorizationModuleOptionsSchema,
  type AuthorizationModuleOptions,
} from '../../config/authorization-options.schema';
import { AuthorizationConfigService } from '../../config/authorization-config.service';
import { AUTHORIZATION_MODULE_OPTIONS } from '../../config/constants';
import { DatabaseService } from '../../database/database.service';
import { RegistryRepository } from '../../registry/registry.repository';
import { RegistryService } from '../../registry/registry.service';
import { PermissionNamespaceRegistry } from '../../registry/permission-namespace.registry';
import { CodeNormalizerService } from '../../services/code-normalizer.service';
import { AuthorizationService } from '../../services/authorization.service';
import { AssignmentsRepository } from '../assignments/assignments.repository';
import { AssignmentsService } from '../assignments/assignments.service';
import { GroupsRepository } from '../groups/groups.repository';
import { GroupsService } from '../groups/groups.service';
import { PermissionResolverService } from './permission-resolver.service';
import { RolesRepository } from '../roles/roles.repository';
import { RolesService } from '../roles/roles.service';

export type RegisterAuthorizationModuleOptions = Partial<AuthorizationModuleOptions>;

@Global()
@Module({})
export class AuthorizationModule {
  static register(options: RegisterAuthorizationModuleOptions): DynamicModule {
    const parsedOptions = authorizationModuleOptionsSchema.parse(AuthorizationModule.resolveOptions(options));

    const providers: Provider[] = [
      {
        provide: AUTHORIZATION_MODULE_OPTIONS,
        useValue: parsedOptions,
      },
      AuthorizationConfigService,
      DatabaseService,
      CodeNormalizerService,
      RegistryRepository,
      RegistryService,
      RolesRepository,
      RolesService,
      GroupsRepository,
      GroupsService,
      AssignmentsRepository,
      AssignmentsService,
      PermissionResolverService,
      AuthorizationService,
      PermissionNamespaceRegistry,
    ];

    return {
      module: AuthorizationModule,
      providers,
      exports: [AuthorizationService, AuthorizationConfigService, DatabaseService, PermissionNamespaceRegistry],
    };
  }

  private static resolveOptions(options: RegisterAuthorizationModuleOptions): AuthorizationModuleOptions {
    return {
      database: {
        connectionString: options.database?.connectionString ?? process.env.DATABASE_URL ?? '',
        ssl: options.database?.ssl ?? false,
        maxPoolSize: options.database?.maxPoolSize ?? 20,
      },
      mode: options.mode ?? 'both',
      assignmentLevel: options.assignmentLevel ?? 'user-role-group',
    };
  }
}
