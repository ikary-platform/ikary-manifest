import { evalCaseSchema, type EvalCase } from '../../core/case-schema';
import { minimalNotesManifest } from '../../fixtures/manifests';

const notesAddCategoryCase: EvalCase = evalCaseSchema.parse({
  id: 'update.notes-add-category',
  suite: 'update',
  type: 'update',
  input: {
    prompt: 'Extend this notes app with categories. Add a category entity with name and color, connect each note to a category, and add CRUD pages and navigation for categories.',
    manifest: minimalNotesManifest,
  },
  expected: {
    entities: ['note', 'category'],
    relations: ['category_id', 'notes'],
    pages: ['note_list', 'note_detail', 'note_create', 'category_list', 'category_create'],
    preservationRules: ['note', 'note_list', 'note_detail'],
    requiredFields: ['spec.entities', 'spec.pages', 'spec.navigation.items'],
    expectedContextItems: ['Existing Manifest', 'Task Type: update'],
  },
  metadata: {
    tags: ['update', 'notes', 'crud'],
    difficulty: 'medium',
    notes: 'UPDATE benchmark for additive changes with preservation.',
  },
});

export default notesAddCategoryCase;
