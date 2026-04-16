import { evalCaseSchema, type EvalCase } from '../../core/case-schema';

const retrievalTaskTrackerCase: EvalCase = evalCaseSchema.parse({
  id: 'retrieval.task-tracker',
  suite: 'retrieval',
  type: 'retrieval',
  input: {
    taskType: 'create',
    prompt: 'Create a sprint-based project task tracker with projects, sprints, and tasks.',
  },
  expected: {
    expectedRetrievalItems: ['projects/01-task-tracker'],
    expectedContextItems: ['Retrieved Context'],
  },
  metadata: {
    tags: ['retrieval', 'projects'],
    difficulty: 'easy',
    notes: 'Retrieval benchmark focused on the task tracker blueprint.',
  },
});

export default retrievalTaskTrackerCase;
