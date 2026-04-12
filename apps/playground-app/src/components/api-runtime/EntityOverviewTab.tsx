import type { EntityDefinition } from '@ikary/contract';
import { FieldsTable } from './FieldsTable';
import { RelationsSection } from './RelationsSection';
import { ComputedFieldsSection } from './ComputedFieldsSection';
import { LifecycleSection } from './LifecycleSection';
import { CapabilitiesSection } from './CapabilitiesSection';
import { PoliciesSection } from './PoliciesSection';
import { ValidationSection } from './ValidationSection';

interface EntityOverviewTabProps {
  entity: EntityDefinition;
}

export function EntityOverviewTab({ entity }: EntityOverviewTabProps) {
  const hasRelations = entity.relations && entity.relations.length > 0;
  const hasComputed = entity.computed && entity.computed.length > 0;
  const hasLifecycle = !!entity.lifecycle;
  const hasCapabilities = entity.capabilities && entity.capabilities.length > 0;
  const hasPolicies = !!entity.policies || !!entity.fieldPolicies;
  const hasValidation = !!entity.validation;

  return (
    <div className="space-y-0">
      {/* Fields */}
      <div>
        <h3 className="mt-6 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          Fields
        </h3>
        <FieldsTable fields={entity.fields} mode="overview" />
      </div>

      {/* Relations */}
      {hasRelations && (
        <div>
          <h3 className="mt-6 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Relations
          </h3>
          <RelationsSection relations={entity.relations!} />
        </div>
      )}

      {/* Computed Fields */}
      {hasComputed && (
        <div>
          <h3 className="mt-6 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Computed Fields
          </h3>
          <ComputedFieldsSection fields={entity.computed!} />
        </div>
      )}

      {/* Lifecycle */}
      {hasLifecycle && (
        <div>
          <h3 className="mt-6 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Lifecycle
          </h3>
          <LifecycleSection lifecycle={entity.lifecycle!} />
        </div>
      )}

      {/* Capabilities */}
      {hasCapabilities && (
        <div>
          <h3 className="mt-6 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Capabilities
          </h3>
          <CapabilitiesSection capabilities={entity.capabilities!} />
        </div>
      )}

      {/* Policies */}
      {hasPolicies && (
        <div>
          <h3 className="mt-6 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Policies
          </h3>
          <PoliciesSection
            policies={entity.policies}
            fieldPolicies={entity.fieldPolicies}
          />
        </div>
      )}

      {/* Validation */}
      {hasValidation && (
        <div>
          <h3 className="mt-6 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Validation
          </h3>
          <ValidationSection validation={entity.validation!} />
        </div>
      )}
    </div>
  );
}
