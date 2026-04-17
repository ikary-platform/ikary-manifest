# evals/fixtures

Reusable fixture data for eval cases and the fixture executor.

## manifests.ts

Exports three manifest objects loaded from the `manifests/examples/` YAML files via `parseManifest`:

| Export | Source |
|---|---|
| `taskTrackerManifest` | `manifests/examples/projects/01-task-tracker.yaml` |
| `crmContactsManifest` | `manifests/examples/crm/01-contacts.yaml` |
| `updatedNotesWithCategoryManifest` | `manifests/examples/notes/01-notes-with-category.yaml` |

The fixture executor (`evals/providers/fixture-manifest.executor.ts`) uses `structuredClone` on these objects so each test case receives an independent copy.
