import type { ScorerResult, EvalCase } from '../core/case-schema';
import {
  containsIdentifier,
  extractEntityKeys,
  extractPageKeys,
  extractPrimitiveKeys,
  extractRelationKeys,
  hasFieldPath,
} from '../core/normalization';

export function makeScorerResult(
  scorer: string,
  passed: boolean,
  diagnostics: string[] = [],
  evidence?: unknown,
  score: number = passed ? 1 : 0,
): ScorerResult {
  return { scorer, passed, diagnostics, evidence, score };
}

export function getPrimaryResult(result: unknown): Record<string, unknown> {
  if (typeof result === 'object' && result !== null && 'finalResult' in result) {
    const finalResult = (result as { finalResult?: unknown }).finalResult;
    if (typeof finalResult === 'object' && finalResult !== null) {
      return finalResult as Record<string, unknown>;
    }
  }
  return typeof result === 'object' && result !== null ? result as Record<string, unknown> : {};
}

export function getInitialResult(result: unknown): Record<string, unknown> {
  if (typeof result === 'object' && result !== null && 'initialResult' in result) {
    const initialResult = (result as { initialResult?: unknown }).initialResult;
    if (typeof initialResult === 'object' && initialResult !== null) {
      return initialResult as Record<string, unknown>;
    }
  }
  return getPrimaryResult(result);
}

export function getTrace(result: unknown): Record<string, unknown> {
  const primary = getPrimaryResult(result);
  return 'trace' in primary
    ? ((primary as { trace?: Record<string, unknown> }).trace ?? {})
    : {};
}

export function getManifest(result: unknown): unknown {
  const primary = getPrimaryResult(result);
  if ('manifest' in primary) {
    return (primary as { manifest?: unknown }).manifest;
  }
  const trace = getTrace(result);
  return trace['candidateManifest'];
}

export function getValidationStage(result: unknown, stage: string): { passed: boolean; errors: string[] } | null {
  const trace = getTrace(result);
  const validation = Array.isArray(trace['validation']) ? trace['validation'] as Array<Record<string, unknown>> : [];
  const match = validation.find((entry) => entry['stage'] === stage);
  if (!match) return null;
  return {
    passed: Boolean(match['passed']),
    errors: Array.isArray(match['errors']) ? (match['errors'] as string[]) : [],
  };
}

export function scoreExpectedCollection(
  scorer: string,
  expected: string[],
  actual: string[],
): ScorerResult {
  const normalizedExpected = expected ?? [];
  if (normalizedExpected.length === 0) {
    return makeScorerResult(scorer, true, [], { actual }, 1);
  }
  const missing = normalizedExpected.filter((item) => !actual.includes(item));
  return makeScorerResult(
    scorer,
    missing.length === 0,
    missing,
    { expected: normalizedExpected, actual },
    normalizedExpected.length === 0 ? 1 : (normalizedExpected.length - missing.length) / normalizedExpected.length,
  );
}

export function scoreIdentifiers(
  scorer: string,
  identifiers: string[],
  manifest: unknown,
  mode: 'present' | 'absent',
): ScorerResult {
  const normalizedIdentifiers = identifiers ?? [];
  if (normalizedIdentifiers.length === 0) {
    return makeScorerResult(scorer, true, [], {}, 1);
  }
  const mismatches = normalizedIdentifiers.filter((identifier) => {
    const present = containsIdentifier(manifest, identifier);
    return mode === 'present' ? !present : present;
  });
  return makeScorerResult(
    scorer,
    mismatches.length === 0,
    mismatches,
    { identifiers: normalizedIdentifiers, mode },
    normalizedIdentifiers.length === 0 ? 1 : (normalizedIdentifiers.length - mismatches.length) / normalizedIdentifiers.length,
  );
}

export function scoreFieldPaths(scorer: string, fieldPaths: string[], manifest: unknown): ScorerResult {
  const normalizedFieldPaths = fieldPaths ?? [];
  if (normalizedFieldPaths.length === 0) {
    return makeScorerResult(scorer, true, [], {}, 1);
  }
  const missing = normalizedFieldPaths.filter((path) => !hasFieldPath(manifest, path));
  return makeScorerResult(
    scorer,
    missing.length === 0,
    missing,
    { fieldPaths: normalizedFieldPaths },
    (normalizedFieldPaths.length - missing.length) / normalizedFieldPaths.length,
  );
}

export function entityKeys(manifest: unknown): string[] {
  return extractEntityKeys(manifest);
}

export function relationKeys(manifest: unknown): string[] {
  return extractRelationKeys(manifest);
}

export function pageKeys(manifest: unknown): string[] {
  return extractPageKeys(manifest);
}

export function primitiveKeys(manifest: unknown): string[] {
  return extractPrimitiveKeys(manifest);
}

export function compareExpectedQuestionIds(testCase: EvalCase, result: unknown): string[] {
  const initial = getInitialResult(result);
  if (!('questions' in initial)) return testCase.expected.clarification.requiredQuestionIds;
  const questions = (initial as { questions?: Array<{ id?: string }> }).questions ?? [];
  const ids = questions.map((question) => question.id).filter((value): value is string => Boolean(value));
  return testCase.expected.clarification.requiredQuestionIds.filter((id) => !ids.includes(id));
}
