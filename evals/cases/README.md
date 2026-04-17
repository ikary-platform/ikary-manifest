# evals/cases

Typed eval cases grouped by suite. Each `*.case.ts` file exports a single `EvalCase` object validated against `evalCaseSchema`.

## Test case schema

Every case declares:

- `id`: unique string (e.g. `create.task-tracker`).
- `suite`: one of `create`, `fix`, `update`, `clarification`, `retrieval`, `context`, `e2e`.
- `type`: the task type the case exercises.
- `input.prompt`: the user prompt sent to the pipeline.
- `input.manifest`: an optional existing manifest (for `fix` and `update` cases).
- `input.clarificationAnswers`: optional answers for clarification replay.
- `expected`: expected entities, pages, relations, primitives, required fields, forbidden items, preservation rules, retrieval items, and clarification behavior.
- `metadata`: tags, difficulty, and optional notes.

## Cases

| ID | Suite | Prompt (truncated) | Expected (1-line) | Difficulty |
|---|---|---|---|---|
| `create.task-tracker` | create | Build a task tracking app for software delivery teams with projects, sprints, and tasks... | 3 entities (project, sprint, task), 4 pages, retrieval from task-tracker example | medium |
| `fix.restore-task-entity` | fix | Repair the attached manifest. The task pages reference a missing task entity... | Restore task entity, preserve project/sprint/dashboard, forbid missing_entity_reference | hard |
| `update.notes-add-category` | update | Extend this notes app with categories. Add a category entity with name and color... | Add category entity + CRUD pages, preserve note/note_list/note_detail | medium |
| `clarification.minimal-crm` | clarification | CRM app | 3 entities (company, contact, activity), 4 pages, require clarification question scope-depth | easy |
| `retrieval.task-tracker` | retrieval | Create a sprint-based project task tracker with projects, sprints, and tasks. | Retrieve projects/01-task-tracker and assemble context | easy |
| `context.task-tracker` | context | Generate a task tracker for engineering teams with projects, sprints, task status, and assignee planning. | Context assembly contains Task Type + Prompt + Retrieved Context | easy |
| `e2e.task-tracker` | e2e | Create a project and sprint task tracker for software teams with dashboard, project/sprint/task pages. | Full pipeline: 3 entities, 4 pages, retrieval + context assembly | medium |
