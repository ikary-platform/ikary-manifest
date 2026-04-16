import { evalCaseSchema, type EvalCase } from '../../core/case-schema';

const contextTaskTrackerCase: EvalCase = evalCaseSchema.parse({
  id: 'context.task-tracker',
  suite: 'context',
  type: 'context',
  input: {
    taskType: 'create',
    prompt: 'Generate a task tracker for engineering teams with projects, sprints, task status, and assignee planning.',
  },
  expected: {
    expectedContextItems: ['Task Type: create', 'Prompt:', 'Retrieved Context'],
    assumptions: ['Use sensible CRUD defaults unless the prompt explicitly requests otherwise.'],
  },
  metadata: {
    tags: ['context', 'projects'],
    difficulty: 'easy',
    notes: 'Context assembly benchmark for a create prompt with relevant retrieval.',
  },
});

export default contextTaskTrackerCase;
