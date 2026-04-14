import type { SchemaCategory } from '@ikary/cell-contract';

export const CATEGORIES: Array<SchemaCategory | 'all'> = [
  'all',
  'entity',
  'manifest',
  'policy',
  'presentation',
  'validation',
  'validation_issue',
];

export const CATEGORY_COLORS: Record<SchemaCategory | 'all', string> = {
  all: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  entity: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  manifest: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  policy: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  presentation: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  validation: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  validation_issue: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
};

export const CATEGORY_DESCRIPTIONS: Record<SchemaCategory | 'all', string> = {
  all: 'Show all schema categories',
  entity: 'Core business object schemas: fields, relations, computed values, lifecycle, and events',
  manifest: 'Top-level manifest schemas: cell envelope, spec, app shell, mount, capabilities, navigation, and pages',
  policy: 'Access control schemas: scopes, action policies, entity policies, field policies, and roles',
  presentation: 'Display and rendering schemas for field presentation configuration',
  validation: 'Validation rule schemas declared in manifests: field rules, entity invariants, and server validators',
  validation_issue: 'Validation output schemas produced at runtime: issue shape, scope, severity, and API error envelopes',
};
