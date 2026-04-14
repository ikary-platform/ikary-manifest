Add a new entity to the Cell Manifest.

Read manifest.json, then ask the user what entity to create.

Use the get_entity_definition_schema MCP tool to confirm the entity shape
before generating.

Generate a complete entity definition with:
- key (snake_case), name, pluralName
- fields with appropriate types
- relations to existing entities if relevant
- lifecycle if the entity has states
- policies (default: view=workspace, create/update=owner, delete=role)

Add the entity to spec.entities in manifest.json.
Add an entity-list page and entity-detail page for the new entity.
Add a navigation item for the list page.

After adding the entity, use the suggest_relations MCP tool with the full
entity list to discover relations you may have missed.

Run: ikary validate manifest.json --explain
If there are errors, use the explain_validation_errors MCP tool for fixes.
