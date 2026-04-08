import { Injectable } from '@nestjs/common';
import { DOMAIN_TEMPLATES } from '../data/domain-templates';
import { ERROR_EXPLANATIONS } from '../data/error-explanations';

export interface RecommendationResult {
  matchedDomain?: string;
  suggestedEntities: Array<{ key: string; name: string; pluralName: string; reason: string; suggestedFields: string[] }>;
  suggestedPages: Array<{ key: string; type: string; title: string; path: string; entity?: string }>;
  suggestedRelations: Array<{ source: string; kind: string; target: string; reason: string }>;
  suggestedNavigation: { items: Array<{ type: string; key: string; pageKey?: string; label: string; children?: any[] }> };
}

export interface PageSetResult {
  pages: Array<{ key: string; type: string; title: string; path: string; entity?: string }>;
  navigation: { items: Array<{ type: string; key: string; pageKey?: string; label: string; children?: any[] }> };
}

export interface RelationSuggestion {
  source: string;
  kind: string;
  target: string;
  reason: string;
}

export interface ErrorExplanationResult {
  path: string;
  problem: string;
  fix: string;
  relatedTools?: string[];
}

@Injectable()
export class GuidanceService {
  recommendStructure(goal: string): RecommendationResult {
    const lower = goal.toLowerCase();

    // Find best matching domain template
    let bestMatch: typeof DOMAIN_TEMPLATES[number] | null = null;
    let bestScore = 0;

    for (const template of DOMAIN_TEMPLATES) {
      const score = template.keywords.filter((kw) => lower.includes(kw)).length;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = template;
      }
    }

    if (!bestMatch) {
      return {
        suggestedEntities: [],
        suggestedPages: [],
        suggestedRelations: [],
        suggestedNavigation: { items: [] },
      };
    }

    const entityKeys = bestMatch.entities.map((e) => e.key);
    const pageSet = this.suggestPages(entityKeys);

    return {
      matchedDomain: bestMatch.keywords[0],
      suggestedEntities: bestMatch.entities,
      suggestedPages: pageSet.pages,
      suggestedRelations: bestMatch.relations,
      suggestedNavigation: pageSet.navigation,
    };
  }

  suggestPages(entityKeys: string[]): PageSetResult {
    const pages: PageSetResult['pages'] = [
      { key: 'dashboard', type: 'dashboard', title: 'Dashboard', path: '/dashboard' },
    ];

    const navChildren: Array<{ type: string; key: string; pageKey: string; label: string }> = [];

    for (const entityKey of entityKeys) {
      const label = entityKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const pluralLabel = label + 's';
      const pathBase = `/${entityKey.replace(/_/g, '-')}s`;

      pages.push(
        { key: `${entityKey}_list`, type: 'entity-list', title: pluralLabel, path: pathBase, entity: entityKey },
        { key: `${entityKey}_detail`, type: 'entity-detail', title: `${label} Detail`, path: `${pathBase}/:id`, entity: entityKey },
        { key: `${entityKey}_create`, type: 'entity-create', title: `New ${label}`, path: `${pathBase}/new`, entity: entityKey },
      );

      navChildren.push({
        type: 'page',
        key: `nav_${entityKey}_list`,
        pageKey: `${entityKey}_list`,
        label: pluralLabel,
      });
    }

    const navigation: PageSetResult['navigation'] = {
      items: [
        { type: 'page', key: 'nav_dashboard', pageKey: 'dashboard', label: 'Dashboard' },
        ...navChildren,
      ],
    };

    return { pages, navigation };
  }

  suggestRelations(entities: Array<{ key: string; fields?: string[] }>): RelationSuggestion[] {
    const suggestions: RelationSuggestion[] = [];
    const keys = entities.map((e) => e.key);

    for (const entity of entities) {
      // Check fields for _id suffix hinting at belongs_to
      for (const field of entity.fields ?? []) {
        const match = field.match(/^(.+)_id$/);
        if (match && keys.includes(match[1])) {
          suggestions.push({
            source: entity.key,
            kind: 'belongs_to',
            target: match[1],
            reason: `Field "${field}" suggests a belongs_to relation to "${match[1]}"`,
          });
        }
      }

      // Check domain template relations
      for (const template of DOMAIN_TEMPLATES) {
        for (const rel of template.relations) {
          if (keys.includes(rel.source) && keys.includes(rel.target) && entity.key === rel.source) {
            if (!suggestions.some((s) => s.source === rel.source && s.target === rel.target)) {
              suggestions.push(rel);
            }
          }
        }
      }
    }

    return suggestions;
  }

  explainErrors(errors: Array<{ field: string; message: string }>): ErrorExplanationResult[] {
    return errors.map((err) => {
      for (const explanation of ERROR_EXPLANATIONS) {
        if (explanation.pattern.test(err.message)) {
          return {
            path: err.field,
            problem: explanation.problem,
            fix: explanation.fix,
            relatedTools: explanation.relatedTools,
          };
        }
      }
      return {
        path: err.field,
        problem: err.message,
        fix: 'Review the field path and consult the relevant schema using get_manifest_schema or get_entity_definition_schema.',
        relatedTools: ['get_manifest_schema'],
      };
    });
  }
}
