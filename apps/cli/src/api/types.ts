export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

export interface ApiValidationResult {
  valid: boolean;
  errors: Array<{ field: string; message: string }>;
}

export interface ApiNormalizeResult {
  valid: boolean;
  manifest?: unknown;
  errors: Array<{ field: string; message: string }>;
}

export interface ApiErrorExplanation {
  path: string;
  problem: string;
  fix: string;
  relatedTools?: string[];
}

export interface ApiRecommendation {
  matchedDomain: string;
  suggestedEntities: Array<{
    key: string;
    name: string;
    pluralName: string;
    reason: string;
    suggestedFields: Array<{ key: string; type: string; name: string }>;
  }>;
  suggestedRelations: Array<{
    source: string;
    kind: string;
    target: string;
    reason: string;
  }>;
  suggestedPages: unknown[];
  suggestedNavigation: unknown;
}
