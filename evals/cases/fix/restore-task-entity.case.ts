import { evalCaseSchema, type EvalCase } from '../../core/case-schema';
import { brokenTaskTrackerMissingTaskEntity } from '../../fixtures/manifests';

const restoreTaskEntityCase: EvalCase = evalCaseSchema.parse({
  id: 'fix.restore-task-entity',
  suite: 'fix',
  type: 'fix',
  input: {
    prompt: 'Repair the attached manifest. The task pages reference a missing task entity. Restore the missing entity and keep the existing project and sprint structures intact.',
    manifest: brokenTaskTrackerMissingTaskEntity,
  },
  expected: {
    entities: ['project', 'sprint', 'task'],
    relations: ['project_id', 'sprint_id'],
    pages: ['task_list', 'task_detail', 'task_create'],
    preservationRules: ['project', 'sprint', 'dashboard', 'project_list'],
    requiredFields: ['spec.entities', 'spec.pages'],
    forbiddenItems: ['missing_entity_reference'],
  },
  metadata: {
    tags: ['fix', 'projects', 'regression'],
    difficulty: 'hard',
    notes: 'FIX benchmark for semantic repair with preservation.',
  },
});

export default restoreTaskEntityCase;
