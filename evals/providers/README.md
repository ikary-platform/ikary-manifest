# evals/providers

Mock and fixture execution helpers for eval runs that do not call real AI providers.

## FixtureManifestTaskExecutor

Returns a deterministic manifest per case ID. No network call, zero latency, zero cost.

Fixture manifest mapping:

| Case ID pattern | Manifest source |
|---|---|
| `create.task-tracker`, `fix.restore-task-entity`, `retrieval.task-tracker`, `context.task-tracker`, `e2e.task-tracker` | `taskTrackerManifest` from `evals/fixtures/manifests.ts` |
| `update.notes-add-category` | `updatedNotesWithCategoryManifest` |
| `clarification.minimal-crm` | `crmContactsManifest` |
| Unrecognized | Guessed from prompt keywords (CRM, notes, or default task tracker) |

Token counts are synthesized from string lengths (`ceil(length / 4)`). Provider is `fixture`, model is `fixture/<executor-name>`.
