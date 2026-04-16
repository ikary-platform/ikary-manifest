import { evalCaseSchema, type EvalCase } from '../../core/case-schema';

const e2eTaskTrackerCase: EvalCase = evalCaseSchema.parse({
  id: 'e2e.task-tracker',
  suite: 'e2e',
  type: 'e2e',
  input: {
    taskType: 'create',
    prompt: 'Create a project and sprint task tracker for software teams with a dashboard, project pages, sprint pages, and task pages.',
  },
  expected: {
    entities: ['project', 'sprint', 'task'],
    pages: ['dashboard', 'project_list', 'sprint_list', 'task_list'],
    expectedRetrievalItems: ['projects/01-task-tracker'],
    expectedContextItems: ['Task Type: create'],
  },
  metadata: {
    tags: ['e2e', 'projects', 'dashboard'],
    difficulty: 'medium',
    notes: 'End-to-end CREATE workflow benchmark.',
  },
});

export default e2eTaskTrackerCase;
