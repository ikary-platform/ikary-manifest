import { evalCaseSchema, type EvalCase } from '../../core/case-schema';

const minimalCrmClarificationCase: EvalCase = evalCaseSchema.parse({
  id: 'clarification.minimal-crm',
  suite: 'clarification',
  type: 'clarification',
  input: {
    taskType: 'create',
    prompt: 'CRM app',
    clarificationAnswers: {
      'scope-depth': 'standard',
    },
  },
  expected: {
    entities: ['company', 'contact', 'activity'],
    pages: ['dashboard', 'contact_list', 'company_list', 'activity_list'],
    clarification: {
      shouldAsk: true,
      requiredQuestionIds: ['scope-depth'],
    },
    expectedContextItems: ['Task Type: create'],
  },
  metadata: {
    tags: ['clarification', 'crm'],
    difficulty: 'easy',
    notes: 'Short prompt that should force one structured clarification round before completion.',
  },
});

export default minimalCrmClarificationCase;
