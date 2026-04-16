import { manifestTaskInputSchema, type ClarificationMode, type ManifestTaskInput } from '@ikary/cell-ai';
import { resolveManifestTaskType, type EvalCase } from './case-schema';

export function buildManifestTaskInput(
  testCase: EvalCase,
  clarificationMode: ClarificationMode,
  clarificationAnswers: Record<string, string> = {},
): ManifestTaskInput {
  return manifestTaskInputSchema.parse({
    type: resolveManifestTaskType(testCase),
    prompt: testCase.input.prompt,
    manifest: testCase.input.manifest ? structuredClone(testCase.input.manifest) : undefined,
    clarificationMode,
    clarificationAnswers,
    metadata: {
      caseId: testCase.id,
      suite: testCase.suite,
      caseType: testCase.type,
      tags: testCase.metadata.tags,
    },
  });
}
