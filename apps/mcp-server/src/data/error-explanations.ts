export interface ErrorExplanation {
  pattern: RegExp;
  problem: string;
  fix: string;
  relatedTools?: string[];
}

export const ERROR_EXPLANATIONS: ErrorExplanation[] = [
  {
    pattern: /entity keys must be unique/i,
    problem: 'Two or more entities share the same key.',
    fix: 'Ensure every entity has a unique "key" value (snake_case).',
    relatedTools: ['get_entity_definition_schema'],
  },
  {
    pattern: /page keys must be unique/i,
    problem: 'Two or more pages share the same key.',
    fix: 'Ensure every page has a unique "key" value.',
    relatedTools: ['get_page_schema'],
  },
  {
    pattern: /field keys must be unique/i,
    problem: 'Two or more fields in the same entity share the same key.',
    fix: 'Rename one of the duplicate field keys.',
    relatedTools: ['get_entity_definition_schema'],
  },
  {
    pattern: /must define at least entities, pages, or navigation/i,
    problem: 'The spec section is empty — no entities, pages, or navigation defined.',
    fix: 'Add at least one entity, page, or navigation item to spec.',
    relatedTools: ['get_manifest_schema', 'recommend_manifest_structure'],
  },
  {
    pattern: /entity.*not defined/i,
    problem: 'A page references an entity key that does not exist in spec.entities.',
    fix: 'Add the referenced entity to spec.entities, or fix the entity key in the page.',
    relatedTools: ['get_page_schema', 'get_entity_definition_schema'],
  },
  {
    pattern: /landing.*page.*not found/i,
    problem: 'The mount.landingPage references a page key that does not exist.',
    fix: 'Set mount.landingPage to a valid page key from spec.pages.',
    relatedTools: ['get_manifest_schema'],
  },
  {
    pattern: /path.*must start with/i,
    problem: 'A page path does not start with "/".',
    fix: 'Prefix the page path with "/" (e.g., "/customers").',
    relatedTools: ['get_page_schema'],
  },
  {
    pattern: /relation.*must end with.*_id/i,
    problem: 'A belongs_to or self relation key does not follow naming convention.',
    fix: 'Rename the relation key to end with "_id" (e.g., "customer_id").',
    relatedTools: ['get_entity_definition_schema'],
  },
  {
    pattern: /lifecycle.*field.*not found/i,
    problem: 'The lifecycle references a field that is not declared in the entity.',
    fix: 'Add the lifecycle field (typically an enum) to the entity\'s fields array.',
    relatedTools: ['get_entity_definition_schema'],
  },
  {
    pattern: /initial.*state.*not valid/i,
    problem: 'The lifecycle initial state is not one of the defined enum values.',
    fix: 'Set lifecycle.initial to one of the enum values of the lifecycle field.',
    relatedTools: ['get_entity_definition_schema'],
  },
  {
    pattern: /apiVersion/i,
    problem: 'The apiVersion is missing or incorrect.',
    fix: 'Set apiVersion to "ikary.co/v1alpha1".',
    relatedTools: ['get_manifest_schema'],
  },
  {
    pattern: /kind/i,
    problem: 'The kind field is missing or incorrect.',
    fix: 'Set kind to "Cell".',
    relatedTools: ['get_manifest_schema'],
  },
  {
    pattern: /enumValues.*empty/i,
    problem: 'An enum field has no values defined.',
    fix: 'Add at least one value to the field\'s enumValues array.',
    relatedTools: ['get_entity_definition_schema'],
  },
  {
    pattern: /shadows? base.*field/i,
    problem: 'A field key conflicts with a system base field (id, createdAt, updatedAt, etc.).',
    fix: 'Rename the field to avoid conflicting with base entity fields.',
    relatedTools: ['get_entity_definition_schema'],
  },
];
