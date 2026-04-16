import { evalCaseSchema, type EvalCase } from '../../core/case-schema';

const taskTrackerCase: EvalCase = evalCaseSchema.parse({
  id: 'create.task-tracker',
  suite: 'create',
  type: 'create',
  input: {
    prompt: 'Build a task tracking app for software delivery teams with projects, sprints, and tasks. Tasks should include assignee, priority, status, due date, and story points. Add CRUD pages and a dashboard.',
  },
  expected: {
    entities: ['project', 'sprint', 'task'],
    relations: ['sprints', 'tasks', 'project_id', 'sprint_id'],
    pages: ['dashboard', 'project_list', 'sprint_list', 'task_list'],
    requiredFields: ['spec.entities', 'spec.pages', 'spec.navigation.items'],
    expectedRetrievalItems: ['projects/01-task-tracker'],
    expectedContextItems: ['Task Type: create', 'Retrieved Context'],
    assumptions: ['Use sensible CRUD defaults unless the prompt explicitly requests otherwise.'],
  },
  metadata: {
    tags: ['projects', 'dashboard', 'crud'],
    difficulty: 'medium',
    notes: 'Core CREATE benchmark using the project task tracker domain.',
  },
});

export default taskTrackerCase;
