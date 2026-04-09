/**
 * Goal: Give the model a compact canonical Cell contract to reduce schema drift.
 */
export const CANONICAL_SCHEMA_PRIMER_PROMPT = `CANONICAL CELL CONTRACT (repeat and follow strictly):
cell_manifest required shape:
{
  "apiVersion": "ikary.io/v1alpha1",
  "kind": "Cell",
  "metadata": { "key": "...", "name": "...", "version": "1.0.0", "description": "..." },
  "spec": {
    "mount": { "title": "...", "mountPath": "/<cell-key>", "landingPage": "<page-key>" },
    "entities": [EntityDefinition],
    "pages": [PageDefinition],
  }
}
EntityDefinition required:
{ "key": "...", "name": "...", "pluralName": "...", "fields": [FieldDefinition] }
FieldDefinition required:
{ "key": "...", "type": "string|text|number|boolean|date|datetime|enum|object", "name": "..." }
PageDefinition required:
{ "key": "...", "type": "entity-list|entity-detail|entity-create|entity-edit", "title": "...", "path": "/...", "entity": "..." }
Studio layout artifact required:
{ "key": "...", "type": "entity-list|entity-detail|entity-create|entity-edit", "title": "...", "path": "/...", "entity": "..." }
Studio action artifact required:
{ "key": "...", "label": "...", "intent": "create|update|delete|submit|confirm|cancel|open|close|toggle|custom" }
Studio permission artifact required:
{ "key": "...", "entity_key": "...", "action": "read|create|update|delete|admin", "scope": "<entity_key>.<verb>" }
Phase 4 patch root object must be exactly:
{ "manifest": ..., "entity_schema": [...], "layout": [...], "action": [...], "permission": [...] }
Patch operations must include op, path, from, value keys in every item.
Do not invent alternative key names. Keep output deterministic and contract-first.`;
