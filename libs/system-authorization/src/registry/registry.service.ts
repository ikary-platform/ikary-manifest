import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { AuthorizationConfigService } from '../config/authorization-config.service';
import { DatabaseService } from '../database/database.service';
import { CodeNormalizerService } from '../services/code-normalizer.service';
import { RegistryRepository } from './registry.repository';
import { registerScopeSchema, setupAuthorizationSchema } from './registry.schemas';

@Injectable()
export class RegistryService {
  constructor(
    @Inject(AuthorizationConfigService) private readonly config: AuthorizationConfigService,
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(RegistryRepository) private readonly repository: RegistryRepository,
    @Inject(CodeNormalizerService) private readonly codeNormalizer: CodeNormalizerService,
  ) {}

  async registerFeature(code: string, description?: string): Promise<void> {
    if (!this.config.isFeatureModeEnabled()) {
      throw new ForbiddenException('Feature mode is disabled for this authorization module.');
    }

    const parsed = registerScopeSchema.parse({ code, description });
    const normalizedCode = this.codeNormalizer.normalizeScopeCode(parsed.code);

    await this.repository.upsertFeature({ code: normalizedCode, description: parsed.description });
  }

  async registerDomain(code: string, description?: string): Promise<void> {
    if (!this.config.isDomainModeEnabled()) {
      throw new ForbiddenException('Domain mode is disabled for this authorization module.');
    }

    const parsed = registerScopeSchema.parse({ code, description });
    const normalizedCode = this.codeNormalizer.normalizeScopeCode(parsed.code);

    await this.repository.upsertDomain({ code: normalizedCode, description: parsed.description });
  }

  async setupAuthorization(input: { features?: string[]; domains?: string[] }): Promise<void> {
    const parsed = setupAuthorizationSchema.parse(input);

    await this.db.withTransaction(async (client) => {
      if (this.config.isFeatureModeEnabled()) {
        for (const feature of parsed.features) {
          await this.repository.upsertFeature({ code: this.codeNormalizer.normalizeScopeCode(feature) }, client);
        }
      }

      if (this.config.isDomainModeEnabled()) {
        for (const domain of parsed.domains) {
          await this.repository.upsertDomain({ code: this.codeNormalizer.normalizeScopeCode(domain) }, client);
        }
      }
    });
  }

  listFeatures() {
    return this.repository.listFeatures();
  }

  listDomains() {
    return this.repository.listDomains();
  }

  async ensureScopeExists(scopeType: 'FEATURE' | 'DOMAIN', scopeCode: string): Promise<boolean> {
    if (scopeType === 'FEATURE') {
      return this.repository.featureExists(scopeCode);
    }

    return this.repository.domainExists(scopeCode);
  }
}
